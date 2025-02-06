import React, { useEffect, useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { getNextUfcEvent, getSignWithEmoji } from "./scraping/getNextUfcEvent";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";
import ExpandedRow from "./ExpandedRow";

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
      primary: "#ffffff", // White text for contrast
      secondary: "#e0e0e0", // Light gray for secondary text
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      color: "#ffffff", // White for headings
    },
  },
});

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

  console.log({ nextCard });
  const cellStyle = {
    color: theme.palette.text.primary,
    textAlign: "center",
  };

  const handleAccordionChange = (index: number) => {
    setExpandedRow(expandedRow === index ? null : index); // Toggle the expanded row
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div
        style={{
          padding: "20px",
          backgroundColor: theme.palette.background.default,
          minHeight: "100vh",
          justifySelf: "center",
        }}
      >
        <Typography variant="h4" gutterBottom align="center">
          {nextCard?.eventName || "Loading..."}
        </Typography>
        {nextCard && (
          <TableContainer component={Paper} sx={{ width: "90vw" }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                  <TableCell
                    sx={{
                      ...cellStyle,
                      fontWeight: "bold",
                    }}
                  >
                    Star Sign
                  </TableCell>
                  <TableCell
                    sx={{
                      ...cellStyle,
                      fontWeight: "bold",
                    }}
                  >
                    Fighter 1
                  </TableCell>
                  <TableCell
                    sx={{
                      ...cellStyle,
                      fontWeight: "bold",
                    }}
                  >
                    Fighter 2
                  </TableCell>
                  <TableCell
                    sx={{
                      ...cellStyle,
                      fontWeight: "bold",
                    }}
                  >
                    Star Sign
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {nextCard?.birthDayData?.map((matchup: any, index: number) => (
                  <>
                    <TableRow
                      key={index}
                      sx={{
                        "&:hover": {
                          backgroundColor: theme.palette.action.hover,
                        },
                        backgroundColor:
                          index % 2 === 0
                            ? theme.palette.background.paper
                            : "#303f9f",
                      }}
                      onClick={() => handleAccordionChange(index)} // Handle row click
                    >
                      <TableCell sx={cellStyle}>
                        {getSignWithEmoji(matchup[0].birthDate)}
                      </TableCell>
                      <TableCell sx={cellStyle}>{matchup[0].name}</TableCell>
                      <TableCell sx={cellStyle}>{matchup[1].name}</TableCell>
                      <TableCell sx={cellStyle}>
                        {getSignWithEmoji(matchup[1].birthDate)}
                      </TableCell>
                    </TableRow>
                    <ExpandedRow
                      matchup={nextCard.matchups[index]}
                      expandedRow={expandedRow === index}
                    />
                  </>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>
    </ThemeProvider>
  );
};

export default App;
