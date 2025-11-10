import express from "express";
import cors from "cors";
import { exec } from "child_process";

const app = express();
app.use(cors());
app.use(express.json());

// POST endpoint for sentiment analysis
app.post("/analyze", (req, res) => {
  const { text } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }

  // Call Python local model (Pony/llama/ggml)
  exec(`python analyze.py "${text.replace(/"/g, '\\"')}"`, (error, stdout, stderr) => {
    if (error) {
      console.error("Error:", error);
      return res.status(500).json({ error: "Analysis failed" });
    }
    
    // Python nundi output
    let sentiment = stdout.trim(); // Positive / Negative
    let suggestion = "";

    if (sentiment === "Negative") {
      suggestion = "Consider rephrasing positively.";
    }

    res.json({ text, sentiment, suggestion });
  });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
