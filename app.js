import { createServer } from "http";
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";


/* =========================================
   PATHS
========================================= */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


/* =========================================
   SERVER CONFIG
========================================= */

const PORT = process.env.PORT || 3000;


/*
   IMPORTANT:
   Make sure your actual file is called:

   data/links.json

   If your file is called link.json instead,
   change "links.json" below to "link.json".
*/

const DATA_FILE = path.join(
    __dirname,
    "data",
    "links.json"
);


/* =========================================
   SERVE STATIC FILES
========================================= */

const serverFile = async (res, filePath, type) => {

    try {

        const data = await readFile(filePath);

        res.writeHead(200, {
            "Content-Type": type
        });

        res.end(data);

    } catch (err) {

        console.error("File error:", err);

        res.writeHead(404, {
            "Content-Type": "text/plain"
        });

        res.end("404 - Page not found");
    }
};


/* =========================================
   LOAD LINKS
========================================= */

const loadLinks = async () => {

    try {

        const data = await readFile(
            DATA_FILE,
            "utf8"
        );

        return JSON.parse(data);

    } catch (err) {

        if (err.code === "ENOENT") {

            await mkdir(
                path.dirname(DATA_FILE),
                {
                    recursive: true
                }
            );

            await writeFile(
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

    await writeFile(
        DATA_FILE,
        JSON.stringify(links, null, 2)
    );
};


/* =========================================
   CREATE SERVER
========================================= */

const server = createServer(
    async (req, res) => {

        try {

            /* =================================
               GET REQUESTS
            ================================= */

            if (req.method === "GET") {


                /* Homepage */

                if (req.url === "/") {

                    return serverFile(
                        res,
                        path.join(
                            __dirname,
                            "public",
                            "index.html"
                        ),
                        "text/html"
                    );
                }


                /* CSS */

                if (req.url === "/css/style.css") {

                    return serverFile(
                        res,
                        path.join(
                            __dirname,
                            "css",
                            "style.css"
                        ),
                        "text/css"
                    );
                }


                /* Get all shortened links */

                if (req.url === "/links") {

                    const links =
                        await loadLinks();

                    res.writeHead(200, {
                        "Content-Type":
                            "application/json"
                    });

                    return res.end(
                        JSON.stringify(links)
                    );
                }


                /* Redirect shortened URL */

                const links =
                    await loadLinks();

                const shortCode =
                    req.url.slice(1);

                console.log(
                    "Link redirect:",
                    req.url
                );


                if (links[shortCode]) {

                    res.writeHead(
                        302,
                        {
                            Location:
                                links[shortCode]
                        }
                    );

                    return res.end();
                }


                /* Short code doesn't exist */

                res.writeHead(404, {
                    "Content-Type":
                        "text/plain"
                });

                return res.end(
                    "Shortened URL is not found"
                );
            }


            /* =================================
               CREATE SHORT URL
            ================================= */

            if (
                req.method === "POST" &&
                req.url === "/shorten"
            ) {

                const links =
                    await loadLinks();

                let data = "";


                req.on(
                    "data",
                    (chunk) => {
                        data += chunk;
                    }
                );


                req.on(
                    "end",
                    async () => {

                        try {

                            const {
                                url,
                                shortCode
                            } = JSON.parse(data);


                            /* Validate URL */

                            if (!url) {

                                res.writeHead(
                                    400,
                                    {
                                        "Content-Type":
                                            "text/plain"
                                    }
                                );

                                return res.end(
                                    "URL is required"
                                );
                            }


                            /* Create short code */

                            const finalShortCode =
                                shortCode ||
                                crypto
                                    .randomBytes(4)
                                    .toString("hex");


                            /* Check duplicate */

                            if (
                                links[
                                    finalShortCode
                                ]
                            ) {

                                res.writeHead(
                                    400,
                                    {
                                        "Content-Type":
                                            "text/plain"
                                    }
                                );

                                return res.end(
                                    "Short code already exists. Please choose another."
                                );
                            }


                            /* Save link */

                            links[
                                finalShortCode
                            ] = url;


                            await saveLinks(
                                links
                            );


                            /* Success */

                            res.writeHead(
                                200,
                                {
                                    "Content-Type":
                                        "application/json"
                                }
                            );

                            res.end(
                                JSON.stringify({
                                    success: true,
                                    shortCode:
                                        finalShortCode
                                })
                            );

                        } catch (error) {

                            console.error(
                                "Shorten error:",
                                error
                            );

                            res.writeHead(
                                400,
                                {
                                    "Content-Type":
                                        "text/plain"
                                }
                            );

                            res.end(
                                "Invalid request"
                            );
                        }
                    }
                );

                return;
            }


            /* =================================
               METHOD NOT FOUND
            ================================= */

            res.writeHead(404, {
                "Content-Type":
                    "text/plain"
            });

            res.end(
                "404 - Route not found"
            );

        } catch (error) {

            console.error(
                "Server error:",
                error
            );

            if (!res.headersSent) {

                res.writeHead(500, {
                    "Content-Type":
                        "text/plain"
                });

                res.end(
                    "Internal server error"
                );
            }
        }
    }
);


/* =========================================
   START SERVER
========================================= */

server.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `Server running on port ${PORT}`
        );

    }
);