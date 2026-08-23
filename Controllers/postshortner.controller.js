import crypto from 'crypto'
import {loadLinks,saveLinks} from '../models/shortner.models.js'
import { fileURLToPath } from "url";
import path from 'path';
import fs from "fs/promises";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export const home_page = async (req, res) => {
    try {
        
        // Inside home_page function
//const filePath = path.join(__dirname, '..', 'views', 'index.html');
//const file = await fs.readFile(filePath, 'utf8');

        // Load all shortened URLs
        const links = await loadLinks();

        return res.render('index',{links,host:req.host})

    } catch (err) {

        console.error(err);

        return res
            .status(500)
            .send("Internal Server Error");
    }
}

export const  postURLShortner= async (req, res) => {

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
};



export const short_code = async (req, res) => {
    try {
        const { shortCode } = req.params;
        const links = await loadLinks();

        if (!links[shortCode]) {
            // Use render instead of sendFile
            return res.status(404).render('error', { 
                // Optional: Pass data to the error page if your template needs it
                message: "URL not found",
                url: req.originalUrl 
            });
        }

        return res.redirect(links[shortCode]);

    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal server error");
    }
};   