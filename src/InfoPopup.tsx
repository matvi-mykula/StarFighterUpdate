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
        sx={{ borderRadius: "50%" }}
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
              // need link
              sx={{
                color: theme.palette.secondary.main,
                cursor: "crosshair",
              }}
            >
              -- Github --
            </Link>
          </DialogContentText>
        </DialogContent>
      </Dialog>
      <Star
        sx={{
          cursor: "crosshair",
          position: "absolute",
          top: "15px",
          left: "15px",
        }}
        onClick={() => {
          setInfoOpen((prev) => !prev);
        }}
      />
    </>
  );
};

export default InfoPopup;
