// /server/routes/index.js
import express from "express";

const router = express.Router();

// GET all posts
router.get("/", async (req, res) => {
    try {
        res.render('pages/index',{layout: "./pages/index" })
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching blog posts');
    }
});


export default router;