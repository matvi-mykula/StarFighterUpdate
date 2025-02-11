import { Star } from "@mui/icons-material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Link,
  useTheme,
} from "@mui/material";
import React, { useState } from "react";

const InfoPopup = () => {
  const theme = useTheme();
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <>
      <Dialog
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        slotProps={{ paper: { sx: { borderRadius: "15px" } } }}
      >
        <DialogTitle sx={{ textAlign: "center" }}>::: About :::</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {/* needs indent */}
            {"    "} Star Fighter Update is a project by MatviMykula with the
            purpose of exploring the link between the astrological heavens and
            the highest level of martial monkey manuevers.
          </DialogContentText>
          <br />
          <DialogContentText sx={{ textAlign: "center" }}>
            <Link
              href="https://github.com/matvi-mykula/StarFighterUpdate"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                cursor: "crosshair",
                color: theme.palette.secondary.main,
                textDecoration: "none",
                fontWeight: "bold",
                fontSize: "1rem",
                transition: "color 0.2s ease-in-out",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              -- GitHub --
            </Link>
          </DialogContentText>
        </DialogContent>
      </Dialog>
      <Star
        sx={{
          size: "large",
          cursor: "crosshair",
          position: "absolute",
          bottom: "25px",
          right: "25px",
        }}
        onClick={() => {
          setInfoOpen((prev) => !prev);
        }}
      />
    </>
  );
};

export default InfoPopup;
