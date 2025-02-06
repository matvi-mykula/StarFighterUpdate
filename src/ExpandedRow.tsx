import { ExpandMore } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Divider,
  TableCell,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import React from "react";

const ExpandedRow = ({
  matchup,
  expandedRow,
}: {
  matchup: [];
  expandedRow: boolean;
}) => {
  const theme = useTheme();
  if (!expandedRow) return null;
  return (
    <TableRow>
      <TableCell colSpan={4} sx={{ padding: 0 }}>
        <Accordion
          expanded={expandedRow} // Check if the row is expanded
          sx={{
            backgroundColor: theme.palette.background.default,
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.text.primary,
            }}
          >
            <Typography>More Info</Typography>
          </AccordionSummary>
          <AccordionDetails
            sx={{
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary,
            }}
          >
            {matchup}
            {/* <Typography variant="body1">
              <strong>Date of Birth:</strong> {matchup[0].birthDate} vs{" "}
              {matchup[1].birthDate}
            </Typography>
            <Divider sx={{ margin: "10px 0" }} />
            <Typography variant="body1">
              <strong>Most Recent Fights:</strong>
            </Typography>
            <Typography variant="body2">
              {matchup[0].name}: {matchup[0].mostRecentFights[0]} |{" "}
              {matchup[0].mostRecentFights[1]}
            </Typography>
            <Typography variant="body2">
              {matchup[1].name}: {matchup[1].mostRecentFights[0]} |{" "}
              {matchup[1].mostRecentFights[1]}
            </Typography>
            <Divider sx={{ margin: "10px 0" }} />
            <Typography variant="body1">
              <strong>Reach:</strong> {matchup[0].reach} vs {matchup[1].reach}
            </Typography> */}
          </AccordionDetails>
        </Accordion>
      </TableCell>
    </TableRow>
  );
};

export default ExpandedRow;
