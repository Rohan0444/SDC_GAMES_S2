import express from "express";
const router = express.Router();

// Home route
router.get("/", (req, res) => {
  res.render("pages/home", { title: "SDC Games | Home" });
});

export default router;
