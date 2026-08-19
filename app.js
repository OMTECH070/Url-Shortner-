import { PORT } from "./env.js";
import express from "express";
import {shortenedRoutes} from "./routes/shortner.routes.js";

const app = express();

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
    express.static("css")
);

app.use(shortenedRoutes)

/* =========================================
   START SERVER
========================================= */

app.listen(PORT, () => {

    console.log(
        `Server is running at port ${PORT}`
    );

});