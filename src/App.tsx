import React, { useEffect, useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Button from "@mui/material/Button";
import { astrologicalSign, getNextUfcEvent } from "./scraping/getNextUfcEvent";
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

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

export const App: React.FC = () => {
  const [nextCard, setNextCard] = useState<any>(null); // State to store event data

  // Fetch the next UFC event on mount
  useEffect(() => {
    const fetchNextEvent = async () => {
      const event = await getNextUfcEvent();
      setNextCard(event); // Update state with the event data
    };

    fetchNextEvent();
  }, []); // Empty dependency array

  console.log({ nextCard });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ padding: "20px" }}>
        <Typography variant="h4" gutterBottom>
          {nextCard?.eventName || "Loading..."}
        </Typography>
        {nextCard && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Fighter 1</TableCell>
                  <TableCell>Astrological Sign</TableCell>
                  <TableCell>Fighter 2</TableCell>
                  <TableCell>Astrological Sign</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {nextCard.birthDayData.map((matchup: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{matchup[0].name}</TableCell>
                    <TableCell>
                      {astrologicalSign(new Date(matchup[0].birthDate))}
                    </TableCell>
                    <TableCell>{matchup[1].name}</TableCell>
                    <TableCell>
                      {astrologicalSign(new Date(matchup[1].birthDate))}
                    </TableCell>
                  </TableRow>
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
