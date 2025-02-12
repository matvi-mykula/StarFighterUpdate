import React, { useEffect, useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { getNextUfcEvent } from "./scraping/getNextUfcEvent";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
} from "@mui/material";
import ExpandingRow from "./ExpandedRow";
import InfoPopup from "./InfoPopup";

// Create a deep blue indigo theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#283593", // Deep indigo
    },
    secondary: {
      main: "#ff4081", // Contrasting pink
    },
    background: {
      default: "#1a237e", // Darker indigo for background
      paper: "#283593", // Slightly lighter indigo for paper components
    },
    text: {
      primary: "#ffffff",
      secondary: "#e0e0e0",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      color: "#ffffff",
    },
  },
});

// todo
// display date
// ensure that while an event is happening the info for that event is shown
//    try switching to http://www.ufcstats.com/statistics/events/completed
// calc mars sign info and display nicely

export const App: React.FC = () => {
  const [nextCard, setNextCard] = useState<any>(null); // State to store event data
  const [expandedRow, setExpandedRow] = useState<number | null>(null); // State to track the expanded row
  // Fetch the next UFC event on mount
  useEffect(() => {
    const fetchNextEvent = async () => {
      const event = await getNextUfcEvent();
      setNextCard(event); // Update state with the event data
    };

    fetchNextEvent();
  }, []); // Empty dependency array

  const cellStyle = {
    color: theme.palette.text.primary,
    textAlign: "center",
    fontWeight: "bold",
    size: "small",
    padding: "4px",
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          backgroundColor: theme.palette.background.default,
          minHeight: "100vh",
          maxWidth: "100vw",
          justifySelf: "center",
        }}
      >
        <InfoPopup />
        <Typography
          align="center"
          sx={{
            fontSize: { xs: "1.2rem", sm: "1.5rem" },
            marginTop: "4rem",
          }}
        >
          {nextCard?.eventDate}
        </Typography>
        <Typography
          variant="h4"
          gutterBottom
          align="center"
          sx={{
            fontSize: { xs: "1.2rem", sm: "1.5rem" },
            marginTop: "2rem",
            marginBottom: nextCard?.eventName ? "2rem" : "80%",
          }}
        >
          {nextCard?.eventName
            ? nextCard?.eventName
            : nextCard?.response?.data?.error
            ? `Error: ${nextCard?.response?.data?.error}`
            : "Loading..."}
        </Typography>

        {nextCard?.eventName && (
          <TableContainer
            component={Paper}
            sx={{ maxWidth: "100%", pointer: "crosshair" }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                  <TableCell
                    sx={{
                      ...cellStyle,
                    }}
                  >
                    Mars Sign
                  </TableCell>
                  <TableCell
                    sx={{
                      ...cellStyle,
                    }}
                  >
                    Star Sign
                  </TableCell>
                  <TableCell
                    sx={{
                      ...cellStyle,
                    }}
                  >
                    Fighter 1
                  </TableCell>
                  <TableCell
                    sx={{
                      ...cellStyle,
                    }}
                  >
                    Fighter 2
                  </TableCell>
                  <TableCell
                    sx={{
                      ...cellStyle,
                    }}
                  >
                    Star Sign
                  </TableCell>
                  <TableCell
                    sx={{
                      ...cellStyle,
                    }}
                  >
                    Mars Sign
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {nextCard?.matchups?.map((matchup: any, index: number) => (
                  <ExpandingRow
                    key={index}
                    birthDates={nextCard.birthDayData[index]}
                    matchup={matchup}
                    expandedRow={expandedRow === index}
                    handleToggle={() =>
                      setExpandedRow(expandedRow === index ? null : index)
                    }
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default App;
