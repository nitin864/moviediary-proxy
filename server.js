import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import https from "https";

dotenv.config();

const app = express();
app.use(cors());

const API_KEY = process.env.TMDB_KEY;

// Bypass SSL issues common with Indian ISPs
const agent = new https.Agent({ rejectUnauthorized: false });

app.get("/favicon.ico", (req, res) => res.status(204));

app.get("/api/popular", async (req, res) => {
  try {
    const r = await fetch(
      `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`,
      { agent }
    );
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/search", async (req, res) => {
  try {
    const q = req.query.q;
    const r = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${q}`,
      { agent }
    );
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/movie/:id", async (req, res) => {
  try {
    const r = await fetch(
      `https://api.themoviedb.org/3/movie/${req.params.id}?api_key=${API_KEY}`,
      { agent }
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