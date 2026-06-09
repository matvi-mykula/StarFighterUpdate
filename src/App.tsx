import React, { useEffect, useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { getNextUfcEvent } from "./scraping/getNextUfcEvent";
import {
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Chip,
  Stack,
} from "@mui/material";
import ExpandingRow from "./ExpandedRow";
import InfoPopup from "./InfoPopup";

const theme = createTheme({
  palette: {
    primary: {
      main: "#312e81",
    },
    secondary: {
      main: "#f59e0b",
    },
    background: {
      default: "#080a12",
      paper: "#18122f",
    },
    text: {
      primary: "#ffffff",
      secondary: "#d6ccff",
    },
    error: {
      main: "#f87171",
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

type NextCard = {
  eventDate: string;
  eventName: string;
  matchups: string[][][];
  birthDayData: Array<Array<{ name: string; birthDate: string }>>;
};

export const App: React.FC = () => {
  const [nextCard, setNextCard] = useState<NextCard | null>(null);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchNextEvent = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const event = await getNextUfcEvent();
      setNextCard(event);
      setExpandedRow(null);
    } catch (error) {
      setNextCard(null);
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to load the next UFC card"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNextEvent();
  }, []);

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
          background:
            "linear-gradient(135deg, #07070d 0%, #18122f 38%, #351934 68%, #0c2830 100%)",
          minHeight: "100vh",
          maxWidth: "100vw",
          color: theme.palette.text.primary,
          overflowX: "hidden",
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(245,158,11,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.07) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            opacity: 0.55,
            pointerEvents: "none",
          },
        }}
      >
        <InfoPopup />
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            width: "min(920px, 100%)",
            mx: "auto",
            px: { xs: 1, sm: 3 },
            py: { xs: 7, sm: 9 },
          }}
        >
          <Stack alignItems="center" spacing={1.5} sx={{ mb: 4 }}>
            <Chip
              label="Star Fighter"
              sx={{
                border: "1px solid rgba(245,158,11,0.55)",
                color: "#fde68a",
                backgroundColor: "rgba(8,10,18,0.72)",
                fontWeight: 700,
                letterSpacing: 0,
              }}
            />
            <Typography
              align="center"
              sx={{
                color: "#fef3c7",
                fontSize: { xs: "0.95rem", sm: "1.05rem" },
                minHeight: "1.5rem",
              }}
            >
              {nextCard?.eventDate || " "}
            </Typography>
            <Typography
              variant="h4"
              align="center"
              sx={{
                fontSize: { xs: "1.45rem", sm: "2rem" },
                fontWeight: 800,
                lineHeight: 1.1,
                textShadow: "0 0 22px rgba(245,158,11,0.28)",
              }}
            >
              {nextCard?.eventName || "Tonight's Card"}
            </Typography>
          </Stack>

          {loading && (
            <Stack alignItems="center" spacing={2} sx={{ mt: 8 }}>
              <CircularProgress size={34} sx={{ color: "#f59e0b" }} />
              <Typography sx={{ color: theme.palette.text.secondary }}>
                Loading the next card...
              </Typography>
            </Stack>
          )}

          {!loading && errorMessage && (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={fetchNextEvent}>
                  Retry
                </Button>
              }
              sx={{
                mx: "auto",
                maxWidth: 620,
                backgroundColor: "rgba(127,29,29,0.72)",
                color: "#fff7ed",
                border: "1px solid rgba(248,113,113,0.45)",
              }}
            >
              {errorMessage}
            </Alert>
          )}

          {!loading && nextCard?.eventName && (
            <TableContainer
              component={Paper}
              sx={{
                maxWidth: "100%",
                backgroundColor: "rgba(17,24,39,0.82)",
                border: "1px solid rgba(245,158,11,0.28)",
                boxShadow:
                  "0 18px 60px rgba(0,0,0,0.35), 0 0 34px rgba(34,211,238,0.12)",
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: "rgba(49,46,129,0.95)",
                      "& th": {
                        borderBottom: "1px solid rgba(245,158,11,0.42)",
                      },
                    }}
                  >
                  {/* <TableCell
                    sx={{
                      ...cellStyle,
                    }}
                  >
                    Mars Sign
                  </TableCell> */}
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
                    aria-label="Matchup details"
                    sx={{
                      ...cellStyle,
                      width: { xs: 32, sm: 44 },
                      padding: "4px 2px",
                    }}
                  />
                  {/* <TableCell
                    sx={{
                      ...cellStyle,
                    }}
                  >
                    Mars Sign
                  </TableCell> */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {nextCard.matchups.map((matchup, index: number) => (
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
      </Box>
    </ThemeProvider>
  );
};

export default App;
