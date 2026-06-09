const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");
const crypto = require("crypto");

const app = express();
const port = 5000;

// Configure CORS so that your frontend at localhost:3000 can access the API
const corsOptions = {
  origin: "*",
  // process.env.NODE_ENV === "development" ? "http://localhost:5000" : "*",
  methods: "GET",
  allowedHeaders: "Content-Type",
};
app.use(cors(corsOptions));

const UFC_STATS_BASE_URL = "http://www.ufcstats.com";

const browserHeaders = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

let ufcStatsCookie = "";

const getCookieHeader = (setCookies = []) =>
  setCookies.map((cookie) => cookie.split(";")[0]).join("; ");

const solveUfcStatsChallenge = async (url, html) => {
  const nonce = html.match(/var nonce="([^"]+)"/)?.[1];
  const zeroCount = Number(
    html.match(/target=new Array\((\d+)\+1\)\.join\('0'\)/)?.[1] || 0
  );

  if (!nonce || !zeroCount) {
    throw new Error("UFCStats browser check changed shape");
  }

  const target = "0".repeat(zeroCount);
  let n = 0;

  while (
    !crypto
      .createHash("sha256")
      .update(`${nonce}:${n}`)
      .digest("hex")
      .startsWith(target)
  ) {
    n += 1;
  }

  const response = await axios.post(
    new URL("/__c", url).toString(),
    new URLSearchParams({ nonce, n: String(n) }).toString(),
    {
      timeout: 10_000,
      maxRedirects: 0,
      validateStatus: () => true,
      headers: {
        ...browserHeaders,
        "Content-Type": "application/x-www-form-urlencoded",
        Origin: UFC_STATS_BASE_URL,
        Referer: url,
        ...(ufcStatsCookie ? { Cookie: ufcStatsCookie } : {}),
      },
    }
  );

  const nextCookie = getCookieHeader(response.headers["set-cookie"]);
  if (nextCookie) {
    ufcStatsCookie = nextCookie;
  }
};

const fetchUfcStatsPage = async (url) => {
  const response = await axios.get(url, {
    timeout: 10_000,
    headers: {
      ...browserHeaders,
      ...(ufcStatsCookie ? { Cookie: ufcStatsCookie } : {}),
    },
    maxRedirects: 5,
  });

  if (
    typeof response.data === "string" &&
    response.data.includes("Checking your browser")
  ) {
    await solveUfcStatsChallenge(url, response.data);

    const retryResponse = await axios.get(url, {
      timeout: 10_000,
      headers: {
        ...browserHeaders,
        ...(ufcStatsCookie ? { Cookie: ufcStatsCookie } : {}),
      },
      maxRedirects: 5,
    });

    return retryResponse.data;
  }

  return response.data;
};

const EVENT_TIME_ZONE = "America/Chicago";
const EVENT_CARD_RETENTION_DAYS_AFTER = 1;

const monthsByName = {
  january: "01",
  february: "02",
  march: "03",
  april: "04",
  may: "05",
  june: "06",
  july: "07",
  august: "08",
  september: "09",
  october: "10",
  november: "11",
  december: "12",
};

const parseEventDateKey = (dateText) => {
  const match = dateText.match(/^([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})$/);
  if (!match) {
    return null;
  }

  const [, monthName, day, year] = match;
  const month = monthsByName[monthName.toLowerCase()];
  if (!month) {
    return null;
  }

  return `${year}-${month}-${day.padStart(2, "0")}`;
};

const getEventTimeZoneDateKey = (dayOffset = 0) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: EVENT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );
  const eventDate = new Date(
    Date.UTC(
      Number(values.year),
      Number(values.month) - 1,
      Number(values.day) + dayOffset
    )
  );

  const year = eventDate.getUTCFullYear();
  const month = String(eventDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(eventDate.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getEventCandidates = ($) =>
  $("table.b-statistics__table-events tr")
    .toArray()
    .map((row) => {
      const element = $(row);
      const anchor = element.find("a").first();
      const eventName = anchor.text().trim();
      const eventLink = anchor.attr("href");
      const eventDate = element.find(".b-statistics__date").text().trim();
      const eventDateKey = parseEventDateKey(eventDate);

      if (!eventName || !eventLink || !eventDateKey) {
        return null;
      }

      return {
        eventName,
        eventLink,
        eventDate,
        eventDateKey,
        location: element.children("td").last().text().trim(),
      };
    })
    .filter(Boolean);

const selectCurrentOrNextEvent = (candidates) => {
  const oldestVisibleEventDateKey = getEventTimeZoneDateKey(
    -EVENT_CARD_RETENTION_DAYS_AFTER
  );
  const uniqueCandidates = new Map();

  candidates.forEach((candidate) => {
    const key = candidate.eventLink;
    if (!uniqueCandidates.has(key)) {
      uniqueCandidates.set(key, candidate);
    }
  });

  return [...uniqueCandidates.values()]
    // Keep the current card visible for the full day after the event.
    .filter((candidate) => candidate.eventDateKey >= oldestVisibleEventDateKey)
    .sort((a, b) => a.eventDateKey.localeCompare(b.eventDateKey))[0];
};

const getFighterProfile = async (fighterLink) => {
  const html = await fetchUfcStatsPage(fighterLink);
  const $ = cheerio.load(html);
  const stats = {};

  $("li.b-list__box-list-item").each((i, item) => {
    const text = $(item).text().replace(/\s+/g, " ").trim();
    const [label, ...valueParts] = text.split(":");
    if (label && valueParts.length) {
      stats[label.trim()] = valueParts.join(":").trim();
    }
  });

  return {
    name: $(".b-content__title-highlight").text().trim(),
    stats,
  };
};

const buildCompletedMatchupTable = async (fighterLinks) => {
  const [fighter1, fighter2] = await Promise.all(
    fighterLinks.map((link) => getFighterProfile(link))
  );

  return [
    ["", fighter1.name, fighter2.name],
    ["Tale of the tape"],
    ["Wins/Losses/Draws", "", ""],
    ["Height", fighter1.stats.Height || "", fighter2.stats.Height || ""],
    ["Weight", fighter1.stats.Weight || "", fighter2.stats.Weight || ""],
    ["Reach", fighter1.stats.Reach || "", fighter2.stats.Reach || ""],
    ["Stance", fighter1.stats.STANCE || "", fighter2.stats.STANCE || ""],
    ["DOB", fighter1.stats.DOB || "", fighter2.stats.DOB || ""],
    ["Striking (Significant Strikes)"],
    [
      "Strikes Landed per Min. (SLpM)",
      fighter1.stats.SLpM || "",
      fighter2.stats.SLpM || "",
    ],
    [
      "Striking Accuracy",
      fighter1.stats["Str. Acc."] || "",
      fighter2.stats["Str. Acc."] || "",
    ],
    [
      "Strikes Absorbed per Min. (SApM)",
      fighter1.stats.SApM || "",
      fighter2.stats.SApM || "",
    ],
    [
      "Takedowns Average/15 min.",
      fighter1.stats["TD Avg."] || "",
      fighter2.stats["TD Avg."] || "",
    ],
    ["Most recent fights", "", ""],
  ];
};

const getCompletedEventMatchups = async ($details) => {
  const completedFightRows = $details("tr.b-fight-details__table-row")
    .toArray()
    .map((row) =>
      $details(row)
        .find('a[href*="/fighter-details/"]')
        .toArray()
        .map((anchor) => $details(anchor).attr("href"))
        .filter(Boolean)
    )
    .filter((fighterLinks) => fighterLinks.length >= 2)
    .slice(0, 4);

  return Promise.all(
    completedFightRows.map((fighterLinks) =>
      buildCompletedMatchupTable(fighterLinks.slice(0, 2))
    )
  );
};

const normalizeUfcStatsLink = (link) => {
  if (!link) {
    return null;
  }

  return link.startsWith("http") ? link : `${UFC_STATS_BASE_URL}${link}`;
};

const getMatchupsForEvent = async (eventLink) => {
  console.log(`Fetching event details from: ${eventLink}`);
  const eventDetailsData = await fetchUfcStatsPage(eventLink);
  const $details = cheerio.load(eventDetailsData);
  const eventTable = $details(".b-fight-details__table");

  if (!eventTable || eventTable.length === 0) {
    console.log("Event details table not found.");
    const error = new Error("Event details table not found");
    error.statusCode = 404;
    throw error;
  }

  const viewMatchupButtons = $details("a, button")
    .filter((i, el) => $details(el).text().trim() === "View Matchup")
    .toArray();

  console.log(`Found ${viewMatchupButtons.length} "View Matchup" buttons.`);

  if (!viewMatchupButtons.length) {
    return getCompletedEventMatchups($details);
  }

  const matchupLinks = viewMatchupButtons
    .map((el) =>
      normalizeUfcStatsLink(
        $details(el).attr("href") || $details(el).attr("data-link")
      )
    )
    .filter(Boolean)
    .slice(0, 4);

  const matchupPages = await Promise.all(
    matchupLinks.map((link) => fetchUfcStatsPage(link))
  );

  return matchupPages.map((html, index) => {
    const $matchup = cheerio.load(html);
    const tables = $matchup("table");

    if (tables.length === 0) {
      console.log(`No tables found on page ${index + 1}`);
      return { error: "No table found" };
    }

    let tableToUse = null;
    tables.each((i, table) => {
      const rowCount = $matchup(table).find("tr").length;
      if (rowCount > 1 && !tableToUse) {
        tableToUse = table;
      }
    });

    if (!tableToUse) {
      console.log(`No suitable table found on page ${index + 1}`);
      return { error: "No suitable table found" };
    }

    const rows = [];
    $matchup(tableToUse)
      .find("tr")
      .each((i, row) => {
        const rowData = [];
        $matchup(row)
          .find("th, td")
          .each((j, cell) => {
            rowData.push($matchup(cell).text().trim());
          });
        if (rowData.length) {
          rows.push(rowData);
        }
      });

    return rows;
  });
};

const getBirthDayData = (matchups) =>
  matchups.map((matchupTable) => {
    const rows = Array.isArray(matchupTable) ? matchupTable : [["", "", ""]];
    const dobRow =
      rows.find((row) => row[0].trim().toLowerCase() === "dob") || [];

    return [
      { name: rows[0][1], birthDate: dobRow[1] },
      { name: rows[0][2], birthDate: dobRow[2] },
    ];
  });

app.get("/next", async (req, res) => {
  try {
    const completedUrl = `${UFC_STATS_BASE_URL}/statistics/events/completed`;
    const upcomingUrl = `${UFC_STATS_BASE_URL}/statistics/events/upcoming`;
    const [completedHtml, upcomingHtml] = await Promise.all([
      fetchUfcStatsPage(completedUrl),
      fetchUfcStatsPage(upcomingUrl),
    ]);

    const selectedEvent = selectCurrentOrNextEvent([
      ...getEventCandidates(cheerio.load(completedHtml)),
      ...getEventCandidates(cheerio.load(upcomingHtml)),
    ]);

    if (!selectedEvent) {
      return res
        .status(404)
        .json({ error: "No current or upcoming event found" });
    }

    const eventLink = normalizeUfcStatsLink(selectedEvent.eventLink);
    console.log(`Found event: ${selectedEvent.eventName}`);
    console.log(`Event link: ${eventLink}`);

    const matchups = await getMatchupsForEvent(eventLink);
    const birthDayData = getBirthDayData(matchups);

    res.status(200).json({
      eventName: selectedEvent.eventName,
      matchups,
      birthDayData,
      eventDate: selectedEvent.eventDate,
    });
  } catch (error) {
    console.error("Error fetching UFC data:", error);
    res
      .status(error.statusCode || 500)
      .json({
        error: error.statusCode ? error.message : "Failed to fetch UFC data",
      });
  }
});

app.get("/api/next", (req, res) => {
  req.url = "/next";
  return app(req, res);
});

if (require.main === module) {
  const localPort = process.env.PORT || 5000;

  app.listen(localPort, () =>
    console.log(`Server is running on port ${localPort}`)
  );
}

module.exports = app;
