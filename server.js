import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/database.js";
import indexRoutes from "./routes/index.js";
import apiRoutes from "./routes/api.js";

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
app.use("/api", apiRoutes);
app.get('/', (req, res) => {
    try {
        // Read hosts data from JSON file
        const hostsData = fs.readFileSync(path.join(__dirname, 'data', 'hosts.json'), 'utf8');
        const data = JSON.parse(hostsData);
        
        // Render the index template with data
        res.render('game-hosts', { data });
    } catch (error) {
        console.error('Error reading hosts data:', error);
        res.status(500).send('Error loading page data');
    }
});
// Participants list page (Among Us themed)
app.get('/partispants', (req, res) => {
    // Render the participants grid; data is fetched client-side from Firestore
    res.render('partispants');
});

// Participant detail page by roll number (Among Us profile)
app.get('/participants/:rollNumber', (req, res) => {
    const rollNumber = req.params.rollNumber;
    res.render('partispant', { rollNumber });
});

// Handle 404
app.use((req, res) => {
  res.status(404).render("error", { message: "Page Not Found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
