// pages/api/crimes.js

import cors from "cors";

const corsMiddleware = cors({
  origin: "*", // Allow requests from any origin
  methods: ["GET", "OPTIONS"], // Allow GET requests and preflight OPTIONS requests
  allowedHeaders: ["Origin", "Accept", "Content-Type", "X-Requested-With", "X-CSRF-Token"], // Allow these headers
});

// API route handler
const handler = async (req, res) => {
  try {
    // Apply CORS middleware
    await new Promise((resolve, reject) => {
      corsMiddleware(req, res, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    // Check the request method
    if (req.method === "GET") {
      // Fetch data from external API or database
      const response = await fetch("http://127.0.0.1/crimes"); // Change URL to your endpoint
      const data = await response.json();

      // Return data as JSON response
      res.status(200).json(data);
    } else {
      // Return error for unsupported methods
      res.status(405).json({ message: "Method Not Allowed" });
    }
  } catch (error) {
    // Handle errors
    console.error("API error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export default handler;
