const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

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

app.get("/next", async (req, res) => {
  // Step 1: Fetch the upcoming events page from UFCStats
  try {
    /* 1. fetch the page — use https and add full browser headers so Cloudflare
         or ModSecurity doesn’t block the request                        */
    const url = "http://www.ufcstats.com/statistics/events/completed";
    const { data: html } = await axios.get(url, {
      timeout: 10_000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      maxRedirects: 5,
    });

    /* 2. parse the DOM */
    const $ = cheerio.load(html);

    /* 3. grab the first *real* row (it’s marked with its own class) */
    const row = $(
      "table.b-statistics__table-events tr.b-statistics__table-row_type_first"
    ).first();

    if (!row.length) {
      return res.status(404).json({ error: "Table row not found" });
    }

    /* 4. extract the bits we need */
    const anchor = row.find("a").first();
    const eventName = anchor.text().trim();
    const eventLink = anchor.attr("href");
    const eventDate = row.find(".b-statistics__date").text().trim();
    const location = row.children("td").last().text().trim();
    // Note: The first row(s) might be header(s). Typically, the first non-header row is at index 1.
    // const eventRow = $upcoming(".b-statistics__table-row").eq(2);
    const eventRow = $(
      "table.b-statistics__table-events tr.b-statistics__table-row_type_first"
    ).first();
    if (!eventRow || !eventRow.html()) {
      console.log("No event row found.");
      return res.status(404).json({ error: "No upcoming event found" });
    }

    if (!eventName || !eventLink) {
      console.log({ eventRow });
      console.log("Event name or link not found.");
      return res.status(404).json({ error: "Event name or link not found" });
    }

    // If the link is relative, prepend the base URL
    if (!eventLink.startsWith("http")) {
      eventLink = "http://www.ufcstats.com" + eventLink;
    }
    console.log(`Found event: ${eventName}`);
    console.log(`Event link: ${eventLink}`);

    // Step 4: Fetch the event details page using the event link
    console.log(`Fetching event details from: ${eventLink}`);
    const { data: eventDetailsData } = await axios.get(eventLink, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
    });

    // Step 5: Load the event details page and extract the event details table
    const $details = cheerio.load(eventDetailsData);

    // Step 5: Locate the table with fight details.
    // (Adjust the selector to match the actual table on the event details page.)
    const eventTable = $details(".b-fight-details__table");
    if (!eventTable || eventTable.length === 0) {
      console.log("Event details table not found.");
      return res.status(404).json({ error: "Event details table not found" });
    }

    // Step 6: For each row in the event details table, find and process the "View Matchup" button.
    // We'll assume that each row that has a matchup button contains an <a> with text "View Matchup".
    // (Adjust the selector if needed.)
    const viewMatchupButtons = $details("a, button")
      .filter((i, el) => $details(el).text().trim() === "View Matchup")
      .toArray();

    console.log(`Found ${viewMatchupButtons.length} "View Matchup" buttons.`);

    if (viewMatchupButtons.length > 0) {
      // Log the attributes of the first element for debugging
      const firstElementAttrs = $details(viewMatchupButtons[0]).attr();
      console.log(
        "Attributes of first 'View Matchup' element:",
        firstElementAttrs
      );
    }

    const matchupLinks = viewMatchupButtons
      .map((el) => {
        // Try to extract the URL from either href or data-link
        let link = $details(el).attr("href") || $details(el).attr("data-link");
        if (link && !link.startsWith("http")) {
          link = "http://www.ufcstats.com" + link;
        }
        return link;
      })
      .filter(Boolean);

    const firstFourMatchupLinks = matchupLinks.slice(0, 4);

    // Step 7: Fetch each matchup page concurrently.
    const matchupPages = await Promise.all(
      firstFourMatchupLinks.map((link) =>
        axios.get(link, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          },
        })
      )
    );

    // Step 8: For each matchup page, extract the matchup table and convert it to a structured object.
    const matchups = matchupPages.map((response, index) => {
      const $matchup = cheerio.load(response.data);

      // Find all tables on the page
      const tables = $matchup("table");

      if (tables.length === 0) {
        console.log(`No tables found on page ${index + 1}`);
        return { error: "No table found" };
      }

      // Look for the first table that has more than one row
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

      // Convert the selected table to an array of rows
      const rows = [];
      $matchup(tableToUse)
        .find("tr")
        .each((i, row) => {
          const rowData = [];
          // Consider both table headers and table cells
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

    const birthDayData = [];

    for (let i = 0; i < 4; i++) {
      // Looping through the first 4 fights to get main card
      const matchupTable = matchups[i]; // Get the DOB row for the current fight
      const dobRow = matchupTable.find(
        (row) => row[0].trim().toLowerCase() === "dob"
      );

      birthDayData[i] = [
        { name: matchupTable[0][1], birthDate: dobRow[1] },
        { name: matchupTable[0][2], birthDate: dobRow[2] },
      ];
    }

    // Step 9: Return the event name, event details table HTML, and the matchup tables.
    // res.json({ eventName, matchups, birthDayData });
    res.status(200).json({ eventName, matchups, birthDayData, eventDate });
  } catch (error) {
    console.error("Error fetching UFC data:", error);
    res.status(500).json({ error: "Failed to fetch UFC data" });
  }
});

if (require.main === module) {
  const localPort = process.env.PORT || 5000;

  app.listen(localPort, () =>
    console.log(`Server is running on port ${localPort}`)
  );
}

module.exports = app;
