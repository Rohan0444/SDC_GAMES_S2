import express from "express";
const router = express.Router();

// Home route
router.get("/", (req, res) => {
  res.render("pages/home", { title: "SDC Games | Home" });
});

// Let's Begin route
router.get("/lets-begin", (req, res) => {
  res.render("pages/lets-begin", { title: "SDC Games | Let's Begin" });
});

// Participants route
router.get("/participants", (req, res) => {
  res.render("pages/participants", { title: "SDC Games | Participants" });
});

// Game Hosts route
router.get("/game-hosts", (req, res) => {
  res.render("pages/game-hosts", { title: "SDC Games | Game Hosts" });
});

// Admin route
router.get("/admin", (req, res) => {
  res.render("pages/admin", { title: "SDC Games | Admin Panel" });
});

export default router;
