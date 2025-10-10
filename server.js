import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import indexRoutes from "./routes/index.js";
//importing host data from json file
import hosts from "./data/hosts.json";
dotenv.config();
connectDB();

const app = express();

// For __dirname usage with ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files (CSS, JS, Images)
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", indexRoutes);
app.get('/hosts', (req, res) => {
  res.render('game-hosts', { hosts });
});

// Handle 404
app.use((req, res) => {
  res.status(404).render("error", { message: "Page Not Found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
