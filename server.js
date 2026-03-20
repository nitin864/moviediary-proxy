import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Allow requests from anywhere (Vercel, GitHub Pages, localhost)
app.use(cors({
  origin: "*",
  methods: ["GET", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));

// Validate API key on startup
const API_KEY = process.env.TMDB_KEY;
if (!API_KEY) {
  console.error("❌ ERROR: TMDB_KEY is not set in environment variables");
  process.exit(1);
}

/* prevent favicon error */
app.get("/favicon.ico", (req, res) => res.status(204).end());

/* health check endpoint */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

/* popular movies */
app.get("/api/popular", async (req, res) => {
  try {
    const page = req.query.page || 1;
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&page=${page}`
    );
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Popular movies error:", error.message);
    res.status(500).json({ 
      error: "Failed to fetch popular movies",
      details: error.message 
    });
  }
});

/* search movies */
app.get("/api/search", async (req, res) => {
  try {
    const query = req.query.q;
    
    if (!query || query.trim() === "") {
      return res.status(400).json({ error: "Search query is required" });
    }
    
    const page = req.query.page || 1;
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
    );
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Search error:", error.message);
    res.status(500).json({ 
      error: "Failed to search movies",
      details: error.message 
    });
  }
});

/* movie details */
app.get("/api/movie/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "Valid movie ID is required" });
    }
    
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&append_to_response=credits,videos,similar`
    );
    
    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ error: "Movie not found" });
      }
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Movie details error:", error.message);
    res.status(500).json({ 
      error: "Failed to fetch movie details",
      details: error.message 
    });
  }
});

/* 404 handler for undefined routes */
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

/* global error handler */
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`🎬 TMDB Proxy running on http://localhost:${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
});