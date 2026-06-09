import React from "react";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import type { BirthChartComparison } from "./scraping/getBirthChartComparison";

const planetOrder = [
  "Sun",
  "Moon",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
];

const tableCellSx = {
  borderBottomColor: "rgba(255,255,255,0.14)",
  color: "#fff7ed",
  fontSize: { xs: "0.72rem", sm: "0.8rem" },
  padding: { xs: "6px 4px", sm: "7px 8px" },
};

const PlacementTable = ({
  fighter,
}: {
  fighter: BirthChartComparison["fighters"][number];
}) => {
  const placementsByPlanet = new Map(
    fighter.placements.map((placement) => [placement.planet, placement])
  );

  return (
    <Box
      sx={{
        border: "1px solid rgba(245,158,11,0.28)",
        backgroundColor: "rgba(15,23,42,0.72)",
        borderRadius: 1,
        overflow: "hidden",
      }}
    >
      <Box sx={{ p: 1.25, borderBottom: "1px solid rgba(245,158,11,0.22)" }}>
        <Typography sx={{ fontWeight: 800, color: "#fde68a", lineHeight: 1.2 }}>
          {fighter.name}
        </Typography>
        <Typography sx={{ color: "#d6ccff", fontSize: "0.78rem" }}>
          {fighter.birthDate || "DOB unavailable"}
        </Typography>
      </Box>

      {fighter.placements.length === 0 ? (
        <Alert
          severity="warning"
          sx={{
            m: 1,
            backgroundColor: "rgba(120,53,15,0.7)",
            color: "#fff7ed",
          }}
        >
          Chart unavailable for this fighter.
        </Alert>
      ) : (
        <TableContainer>
          <Table size="small" sx={{ tableLayout: "fixed" }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ ...tableCellSx, color: "#fde68a" }}>
                  Planet
                </TableCell>
                <TableCell sx={{ ...tableCellSx, color: "#fde68a" }}>
                  Sign
                </TableCell>
                <TableCell sx={{ ...tableCellSx, color: "#fde68a" }}>
                  Deg Range
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {planetOrder.map((planet) => {
                const placement = placementsByPlanet.get(planet);
                if (!placement) {
                  return null;
                }

                return (
                  <TableRow key={planet}>
                    <TableCell sx={tableCellSx}>{planet}</TableCell>
                    <TableCell sx={tableCellSx}>{placement.sign}</TableCell>
                    <TableCell sx={tableCellSx}>
                      {placement.degreeRange}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

const BirthChartComparisonModal = ({
  open,
  onClose,
  loading,
  error,
  comparison,
}: {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  error: string | null;
  comparison: BirthChartComparison | null;
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    fullWidth
    maxWidth="md"
    PaperProps={{
      sx: {
        backgroundColor: "rgba(8,10,18,0.98)",
        color: "#fff7ed",
        border: "1px solid rgba(245,158,11,0.38)",
        boxShadow: "0 22px 80px rgba(0,0,0,0.58)",
      },
    }}
  >
    <DialogTitle
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
        color: "#fde68a",
        fontWeight: 900,
        pr: 1,
      }}
    >
      Birth Chart Comparison
      <IconButton aria-label="Close birth chart comparison" onClick={onClose}>
        <Close sx={{ color: "#fde68a" }} />
      </IconButton>
    </DialogTitle>

    <DialogContent sx={{ pt: 0, pb: 3 }}>
      {loading && (
        <Stack alignItems="center" spacing={2} sx={{ py: 6 }}>
          <CircularProgress size={34} sx={{ color: "#f59e0b" }} />
          <Typography sx={{ color: "#d6ccff" }}>
            Calculating date-only charts...
          </Typography>
        </Stack>
      )}

      {!loading && error && (
        <Alert
          severity="error"
          sx={{
            backgroundColor: "rgba(127,29,29,0.72)",
            color: "#fff7ed",
            border: "1px solid rgba(248,113,113,0.45)",
          }}
        >
          {error}
        </Alert>
      )}

      {!loading && !error && comparison && (
        <Stack spacing={2}>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            <Chip
              label="Date-only chart using the full UTC birth date"
              sx={{
                color: "#cffafe",
                backgroundColor: "rgba(8,145,178,0.22)",
                border: "1px solid rgba(34,211,238,0.38)",
              }}
            />
            <Chip
              label="No birth time assumed; houses and rising sign are not shown"
              sx={{
                color: "#fde68a",
                backgroundColor: "rgba(146,64,14,0.28)",
                border: "1px solid rgba(245,158,11,0.38)",
              }}
            />
          </Stack>

          {comparison.warnings
            .filter((warning, index, warnings) => warnings.indexOf(warning) === index)
            .map((warning) => (
              <Alert
                key={warning}
                severity="info"
                sx={{
                  backgroundColor: "rgba(49,46,129,0.52)",
                  color: "#fff7ed",
                  border: "1px solid rgba(214,204,255,0.18)",
                }}
              >
                {warning}
              </Alert>
            ))}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 2,
            }}
          >
            {comparison.fighters.map((fighter) => (
              <PlacementTable key={`${fighter.name}-${fighter.birthDate}`} fighter={fighter} />
            ))}
          </Box>

          <Box>
            <Typography
              sx={{
                color: "#fde68a",
                fontWeight: 900,
                mb: 1,
                fontSize: "1rem",
              }}
            >
              Synastry Aspects
            </Typography>

            {comparison.synastry.length === 0 ? (
              <Alert
                severity="info"
                sx={{
                  backgroundColor: "rgba(49,46,129,0.52)",
                  color: "#fff7ed",
                  border: "1px solid rgba(214,204,255,0.18)",
                }}
              >
                No possible major aspects found with the current v1 orb rules.
              </Alert>
            ) : (
              <TableContainer
                sx={{
                  border: "1px solid rgba(34,211,238,0.2)",
                  borderRadius: 1,
                  overflowX: "auto",
                }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ ...tableCellSx, color: "#fde68a" }}>
                        Fighter 1
                      </TableCell>
                      <TableCell sx={{ ...tableCellSx, color: "#fde68a" }}>
                        Aspect
                      </TableCell>
                      <TableCell sx={{ ...tableCellSx, color: "#fde68a" }}>
                        Fighter 2
                      </TableCell>
                      <TableCell sx={{ ...tableCellSx, color: "#fde68a" }}>
                        Orb
                      </TableCell>
                      <TableCell sx={{ ...tableCellSx, color: "#fde68a" }}>
                        Label
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {comparison.synastry.map((aspect, index) => (
                      <TableRow key={`${aspect.fighterAPlanet}-${aspect.fighterBPlanet}-${index}`}>
                        <TableCell sx={tableCellSx}>
                          {aspect.fighterAPlanet}
                        </TableCell>
                        <TableCell sx={tableCellSx}>{aspect.aspect}</TableCell>
                        <TableCell sx={tableCellSx}>
                          {aspect.fighterBPlanet}
                        </TableCell>
                        <TableCell sx={tableCellSx}>
                          {aspect.orbRange}
                        </TableCell>
                        <TableCell sx={tableCellSx}>
                          {aspect.label} ({aspect.certainty})
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Stack>
      )}
    </DialogContent>
  </Dialog>
);

export default BirthChartComparisonModal;
