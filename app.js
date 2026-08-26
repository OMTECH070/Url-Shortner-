import { env } from "./config/env.js";
import express from "express";
import { shortenedRoutes } from "./routes/shortner.routes.js";
import { connectDB } from "./config/db-client.js"; // Import DB connection
import path from 'path';
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* =========================================
   MIDDLEWARE
========================================= */

// Set EJS as the view engine
app.set('view engine', 'ejs');
// Set the folder where EJS files are located (usually 'views')
app.set('views', path.join(__dirname, 'views'));

app.use(express.static("public", {
    index: false
}));

app.use(express.urlencoded({
    extended: true
}));

app.use("/css", express.static(path.join(__dirname, "css")));

/* =========================================
   ROUTES
========================================= */

// Mount the routes
app.use(shortenedRoutes);

/* =========================================
   START SERVER
========================================= */

async function startServer() {
    try {
        // 1. Connect to MongoDB BEFORE starting the server
        await connectDB();
        console.log("MongoDB connected successfully.");

        // 2. Start the server
        app.listen(env.PORT, () => {
            console.log(`Server is running at port ${env.PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

startServer();