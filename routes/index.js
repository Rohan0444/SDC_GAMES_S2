import express from "express";
const router = express.Router();

// Home route
router.get("/", (req, res) => {
  res.render("pages/home-2", { title: "SDC Games | Home" });
});

// // New Home route (Winners page)
// router.get("/home-2", (req, res) => {
//   res.render("pages/home-2", { title: "SDC Games | Winners" });
// });

// Let's Begin route
router.get("/lets-begin", (req, res) => {
  res.render("pages/lets-begin-2", { title: "SDC Games | Let's Begin" });
});

// Game Over route
// router.get("/lets-begin-2", (req, res) => {
//   res.render("pages/lets-begin-2", { title: "SDC Games | Game Over" });
// });

// Participants route
router.get("/participants", (req, res) => {
  res.render("pages/participants", { title: "SDC Games | Participants" });
});

// Game Hosts route is handled in server.js with hosts data

// Admin route
router.get("/uddzEY9oMH2ruiNeASqu", (req, res) => {
  res.render("pages/admin", { title: "SDC Games | Admin Panel" });
});

export default router;
