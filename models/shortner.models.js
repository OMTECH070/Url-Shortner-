import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";


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
    "..",
    "data",
    "links.json"
);


/* =========================================
   LOAD LINKS
========================================= */

export const loadLinks = async () => {

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

export const saveLinks = async (links) => {

    await fs.writeFile(
        DATA_FILE,
        JSON.stringify(links, null, 2)
    );
};
