const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
const port = 5000;

// Configure CORS so that your frontend at localhost:3000 can access the API
const corsOptions = {
  origin: "http://localhost:3000",
  methods: "GET",
  allowedHeaders: "Content-Type",
};
app.use(cors(corsOptions));

app.get("/api/next-ufc-card", async (req, res) => {
  try {
    // Step 1: Fetch the upcoming events page from UFCStats
    const upcomingUrl = "http://www.ufcstats.com/statistics/events/upcoming";
    console.log(`Fetching upcoming events from: ${upcomingUrl}`);
    const { data: upcomingData } = await axios.get(upcomingUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", // Mimic a browser
      },
    });

    // Step 2: Load the HTML using Cheerio
    const $upcoming = cheerio.load(upcomingData);

    // Note: The first row(s) might be header(s). Typically, the first non-header row is at index 1.
    const eventRow = $upcoming(".b-statistics__table-row").eq(2);
    if (!eventRow || !eventRow.html()) {
      console.log("No event row found.");
      return res.status(404).json({ error: "No upcoming event found" });
    }

    // Step 3: Extract the event name and link from the row
    const eventName = eventRow.find("a").text().trim();
    let eventLink = eventRow.find("a").attr("href");
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
    const tableContent = eventTable.html();
    console.log("Successfully fetched event details table.");

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

    console.log({ matchups });
    // const dobRow = matchups.find(
    //   (row) => row[0].trim().toLowerCase() === "dob"
    // );
    // construct an object that is an array of arrays of objects{name:string, date:DOB}
    const birthDayData = [];

    // Assuming you already have an array of rows from the table, each with a structure similar to:
    // [['DOB', 'Jan 14, 1994', 'Feb 27, 1991'], ...]

    for (let i = 0; i < 4; i++) {
      // Looping through the first 4 fights
      const matchupTable = matchups[i]; // Get the DOB row for the current fight
      console.log({ matchupTable });
      const dobRow = matchupTable.find(
        (row) => row[0].trim().toLowerCase() === "dob"
      );

      birthDayData[i] = [
        { name: matchupTable[0][1], birthDate: dobRow[1] },
        { name: matchupTable[0][2], birthDate: dobRow[2] },
      ];
    }

    // Step 9: Return the event name, event details table HTML, and the matchup tables.
    res.json({ eventName, matchups, birthDayData });
  } catch (error) {
    console.error("Error fetching UFC data:", error);
    res.status(500).json({ error: "Failed to fetch UFC data" });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
