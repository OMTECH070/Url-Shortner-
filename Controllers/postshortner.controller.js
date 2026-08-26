import crypto from 'crypto'
import {loadLinks,saveLinks,getLinkByShortCode} from '../models/shortner.models.js'




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
        // links[finalShortCode] = url;


        // Save updated links
        // await saveLinks(links);

        await saveLinks({url,shortCode})


        // Go back to homepage
        return res.redirect("/");

    } catch (error) {

        console.error(error);

        return res
            .status(500)
            .send("Internal server error");
    }
};



/* =========================================
   REDIRECT SHORT URL (GET /:shortCode)
========================================= */
export const short_code = async (req, res) => {
  const { shortCode } = req.params;

  try {
    // Find the link by shortCode
    const linkData = await getLinkByShortCode(shortCode);

    // If not found, render 404 page
    if (!linkData) {
      return res.status(404).render('404', { shortCode });
    }

    // Redirect to the original URL
    res.redirect(linkData.url);
  } catch (err) {
    console.error('Redirect error:', err);
    res.status(500).render('error', { message: 'Server error' });
  }
};