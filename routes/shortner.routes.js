import fs from "fs/promises";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import { Router } from "express";

const router =Router()

/* =========================================
   PATHS
========================================= */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



/* =========================================
   DATA FILE
========================================= */

const DATA_FILE = path.join(
    __dirname,
    "data",
    "links.json"
);


/* =========================================
   LOAD LINKS
========================================= */

const loadLinks = async () => {

    try {

        const data = await fs.readFile(
            DATA_FILE,
            "utf8"
        );

        return JSON.parse(data);

    } catch (err) {

        // If links.json doesn't exist
        if (err.code === "ENOENT") {

            // Create data folder
            await fs.mkdir(
                path.dirname(DATA_FILE),
                {
                    recursive: true
                }
            );

            // Create empty links.json
            await fs.writeFile(
                DATA_FILE,
                JSON.stringify({}, null, 2)
            );

            return {};
        }

        console.error(
            "Error loading links:",
            err
        );

        throw err;
    }
};


/* =========================================
   SAVE LINKS
========================================= */

const saveLinks = async (links) => {

    await fs.writeFile(
        DATA_FILE,
        JSON.stringify(links, null, 2)
    );
};


/* =========================================
   HOME PAGE
========================================= */

router.get("/", async (req, res) => {

    try {

        // Path to index.html
        const homePagePath = path.join(
            __dirname,
            "public",
            "index.html"
        );

        // Read index.html
        const file = await fs.readFile(
            homePagePath,
            "utf8"
        );

        // Load all shortened URLs
        const links = await loadLinks();

        // Generate HTML for shortened URLs
        const shortenedUrls = Object.entries(links)
            .map(
                ([shortCode, url]) =>
                    `<li>
                        <a
                            href="/${shortCode}"
                            target="_blank"
                        >
                            ${req.get("host")}/${shortCode}
                        </a>
                        - ${url}
                    </li>`
            )
            .join("");

        // Replace placeholder in HTML
        const content = file.replaceAll(
            "{{shortened_urls}}",
            shortenedUrls
        );

        // Send final HTML
        return res.send(content);

    } catch (err) {

        console.error(err);

        return res
            .status(500)
            .send("Internal Server Error");
    }
});


/* =========================================
   CREATE SHORT URL
========================================= */

router.post("/", async (req, res) => {

    try {

        // Get data from form
        const {
            url,
            shortCode
        } = req.body;


        // Generate shortcode if user didn't provide one
        const finalShortCode =
            shortCode ||
            crypto
                .randomBytes(4)
                .toString("hex");


        // Load existing links
        const links = await loadLinks();


        // Check if shortcode already exists
        if (links[finalShortCode]) {

            return res
                .status(400)
                .send(
                    "Short code already exists. Please choose another."
                );
        }


        // Store URL
        links[finalShortCode] = url;


        // Save updated links
        await saveLinks(links);


        // Go back to homepage
        return res.redirect("/");

    } catch (error) {

        console.error(error);

        return res
            .status(500)
            .send("Internal server error");
    }
});


/* =========================================
   REDIRECT SHORT URL
========================================= */

router.get("/:shortCode", async (req, res) => {

    try {

        // Get shortcode from URL
        const {
            shortCode
        } = req.params;


        // Load links
        const links = await loadLinks();


        // Check if shortcode exists
        if (!links[shortCode]) {

            return res
                .status(404)
                .sendFile(
                path.join(
                    __dirname,
                    "public",
                    "error.html"
            )
        );
        }


        // Redirect to original URL
        return res.redirect(
            links[shortCode]
        );

    } catch (error) {

        console.error(error);

        return res
            .status(500)
            .send("Internal server error");
    }
});

//export default router

export const shortenedRoutes=router


