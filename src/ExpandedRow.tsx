import {
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  useTheme,
  IconButton,
  Button,
  Box,
} from "@mui/material";
import {
  CompareArrows,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from "@mui/icons-material";
import React from "react";
import { getSignWithEmoji } from "./scraping/getNextUfcEvent";

const ExpandingRow = ({
  matchup,
  expandedRow,
  handleToggle,
  birthDates,
  onCompareBirthCharts,
}: {
  matchup: string[][];
  expandedRow: boolean;
  handleToggle: () => void;
  birthDates: any;
  onCompareBirthCharts: () => void;
}) => {
  const theme = useTheme();
  const importantStats = [
    "",
    "DOB",
    "Wins/Losses/Draws",
    "Takedowns Average/15 min.",
    "Reach",
    "Most recent fights",
  ];

  return (
    <>
      {/* Main Row (Clickable to Expand) */}
      <TableRow
        onClick={handleToggle}
        sx={{
          cursor: "pointer",
          "& td": {
            borderBottomColor: "rgba(245,158,11,0.22)",
            padding: { xs: "4px 2px", sm: "6px 8px" },
            fontSize: { xs: "0.72rem", sm: "0.875rem" },
            lineHeight: 1.15,
            overflowWrap: "anywhere",
            wordBreak: "break-word",
          },
          "&:hover": { backgroundColor: "rgba(34,211,238,0.12)" },
          backgroundColor: expandedRow
            ? "rgba(245,158,11,0.14)"
            : "inherit",
        }}
      >
        {/* <TableCell sx={{ textAlign: "center" }}>
          {getMarsSign(birthDates[0].birthDate)}
        </TableCell> */}
        {/* Fighter 1's Sign */}
        <TableCell sx={{ textAlign: "center" }}>
          {getSignWithEmoji(birthDates[0].birthDate)}
        </TableCell>

        {/* Fighter 1 Name */}
        <TableCell sx={{ textAlign: "center", overflowWrap: "anywhere" }}>
          {matchup[0][1]}
        </TableCell>

        {/* Fighter 2 Name */}
        <TableCell sx={{ textAlign: "center", overflowWrap: "anywhere" }}>
          {matchup[0][2]}
        </TableCell>

        {/* Fighter 2's Sign */}
        <TableCell sx={{ textAlign: "center" }}>
          {getSignWithEmoji(birthDates[1].birthDate)}
        </TableCell>
        {/* <TableCell sx={{ textAlign: "center" }}>
          {getMarsSign(birthDates[1].birthDate)}
        </TableCell> */}
        <TableCell sx={{ textAlign: "center", padding: "0 2px !important" }}>
          <IconButton
            aria-label={
              expandedRow ? "Collapse matchup details" : "Expand matchup details"
            }
            aria-expanded={expandedRow}
            size="small"
            onClick={(event) => {
              event.stopPropagation();
              handleToggle();
            }}
            sx={{
              color: expandedRow ? "#fde68a" : theme.palette.text.primary,
              padding: { xs: "2px", sm: "4px" },
              transition: "color 160ms ease, transform 160ms ease",
              transform: expandedRow ? "translateY(-1px)" : "translateY(0)",
            }}
          >
            {expandedRow ? (
              <KeyboardArrowUp fontSize="small" />
            ) : (
              <KeyboardArrowDown fontSize="small" />
            )}
          </IconButton>
        </TableCell>
      </TableRow>

      {/* Expanding Row */}
      <TableRow>
        <TableCell
          colSpan={5}
          sx={{
            padding: 0,
            borderBottom: expandedRow ? undefined : 0,
          }}
        >
          <Collapse in={expandedRow} timeout={260} unmountOnExit>
            <TableContainer
              component={Paper}
              sx={{
                backgroundColor: "rgba(15,23,42,0.92)",
                borderTop: "1px solid rgba(245,158,11,0.25)",
                borderBottom: "1px solid rgba(34,211,238,0.2)",
                borderRadius: 0,
                margin: "4px 0",
                overflowX: "hidden",
              }}
            >
              <Table
                size="small"
                sx={{
                  tableLayout: "fixed",
                  width: "100%",
                  "& td": {
                    boxSizing: "border-box",
                    overflowWrap: "anywhere",
                    wordBreak: "break-word",
                  },
                }}
              >
                <TableBody>
                  {matchup
                    .filter((row) => importantStats.includes(row[0]))
                    .map((row, index) => (
                      <TableRow key={index}>
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            fontSize: "0.75rem",
                            width: { xs: "34%", sm: "25%" },
                            color: "#fde68a",
                            borderBottomColor: "rgba(255,255,255,0.16)",
                          }}
                        >
                          {row[0]}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontSize: "0.75rem",
                            borderBottomColor: "rgba(255,255,255,0.16)",
                          }}
                        >
                          {row[1]}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontSize: "0.75rem",
                            borderBottomColor: "rgba(255,255,255,0.16)",
                          }}
                        >
                          {row[2]}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  px: 1,
                  py: 1.25,
                }}
              >
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<CompareArrows fontSize="small" />}
                  onClick={(event) => {
                    event.stopPropagation();
                    onCompareBirthCharts();
                  }}
                  sx={{
                    borderColor: "rgba(34,211,238,0.55)",
                    color: "#cffafe",
                    fontWeight: 800,
                    textTransform: "none",
                    "&:hover": {
                      borderColor: "#22d3ee",
                      backgroundColor: "rgba(34,211,238,0.12)",
                    },
                  }}
                >
                  Compare Birth Charts
                </Button>
              </Box>
            </TableContainer>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export default ExpandingRow;
