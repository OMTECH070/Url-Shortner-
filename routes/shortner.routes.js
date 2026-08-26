// routes/shortner.routes.js
import { Router } from "express";
import { postURLShortner, home_page, short_code } from '../Controllers/postshortner.controller.js';

const router = Router();

/* =========================================
   HOME PAGE
========================================= */
router.get("/", home_page);

/* =========================================
   CREATE SHORT URL
========================================= */
router.post("/", postURLShortner);

/* =========================================
   REDIRECT SHORT URL
========================================= */
router.get("/:shortCode", short_code);

export const shortenedRoutes = router;