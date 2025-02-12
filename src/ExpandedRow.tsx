import {
  Accordion,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  useTheme,
} from "@mui/material";
import React from "react";
import { getSignWithEmoji } from "./scraping/getNextUfcEvent";
import getMarsSignApprox from "./scraping/getMarsSignApprox";
import getMarsSign from "./scraping/getMarsSignApprox";

const ExpandingRow = ({
  matchup,
  expandedRow,
  handleToggle,
  birthDates,
}: {
  matchup: string[][];
  expandedRow: boolean;
  handleToggle: () => void;
  birthDates: any;
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
          "&:hover": { backgroundColor: theme.palette.action.hover },
          backgroundColor: expandedRow
            ? theme.palette.action.selected
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
        <TableCell sx={{ textAlign: "center" }}>{matchup[0][1]}</TableCell>

        {/* Fighter 2 Name */}
        <TableCell sx={{ textAlign: "center" }}>{matchup[0][2]}</TableCell>

        {/* Fighter 2's Sign */}
        <TableCell sx={{ textAlign: "center" }}>
          {getSignWithEmoji(birthDates[1].birthDate)}
        </TableCell>
        {/* <TableCell sx={{ textAlign: "center" }}>
          {getMarsSign(birthDates[1].birthDate)}
        </TableCell> */}
      </TableRow>

      {/* Expanding Row */}
      {expandedRow && (
        <TableRow>
          <TableCell colSpan={4} sx={{ padding: 0 }}>
            <Accordion expanded sx={{ boxShadow: "none", margin: 0 }}>
              <AccordionDetails
                sx={{
                  padding: "4px",
                  backgroundColor: theme.palette.background.paper,
                }}
              >
                <TableContainer
                  component={Paper}
                  sx={{ backgroundColor: theme.palette.primary.light }}
                >
                  <Table size="small">
                    <TableBody>
                      {matchup
                        .filter((row) => importantStats.includes(row[0]))
                        .map((row, index) => (
                          <TableRow key={index}>
                            <TableCell
                              sx={{
                                fontWeight: "bold",
                                fontSize: "0.75rem",
                                width: "25%",
                              }}
                            >
                              {row[0]}
                            </TableCell>
                            <TableCell sx={{ fontSize: "0.75rem" }}>
                              {row[1]}
                            </TableCell>
                            <TableCell sx={{ fontSize: "0.75rem" }}>
                              {row[2]}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export default ExpandingRow;
