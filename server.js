import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Allow requests from anywhere (Vercel, GitHub Pages, localhost)
app.use(cors({
  origin: "*",
  methods: ["GET"],
}));

const API_KEY = process.env.TMDB_KEY;

/* prevent favicon error */
app.get("/favicon.ico", (req, res) => res.status(204));

/* popular movies */
app.get("/api/popular", async (req, res) => {
  try {
    const r = await fetch(
      `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`
    );
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* search movies */
app.get("/api/search", async (req, res) => {
  try {
    const q = req.query.q;
    const r = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${q}`
    );
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* movie details */
app.get("/api/movie/:id", async (req, res) => {
  try {
    const r = await fetch(
      `https://api.themoviedb.org/3/movie/${req.params.id}?api_key=${API_KEY}`
    );
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(3000, () => {
  console.log("TMDB Proxy running on http://localhost:3000");
});
