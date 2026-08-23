import { PORT } from "./env.js";
import express from "express";
import {shortenedRoutes} from "./routes/shortner.routes.js";
import path from 'path'
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* =========================================
   MIDDLEWARE
========================================= */

app.use(express.static("public", {
    index: false
}));

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(
    "/css",
    express.static(path.join(__dirname,"css"))
);


app.set('view engine','ejs')

app.use(shortenedRoutes)

/* =========================================
   START SERVER
========================================= */

app.listen(PORT, () => {

    console.log(
        `Server is running at port ${PORT}`
    );

});