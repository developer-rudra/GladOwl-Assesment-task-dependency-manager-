import express from "express";
import cors from "cors";
import crypto from "crypto";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Groq setup (OpenAI-compatible)
const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY, // ✅ use GROQ key
  baseURL: "https://api.groq.com/openai/v1", // ✅ required
});

// In-memory cache
const cache = new Map();

/**
 * Hash input for caching
 */
function hashInput(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

/**
 * Build adjacency list
 */
function buildAdjacencyList(edges) {
  const adj = {};
  edges.forEach((edge) => {
    if (!adj[edge.source]) adj[edge.source] = [];
    adj[edge.source].push(edge.target);
  });
  return adj;
}

/**
 * DFS cycle detection
 */
function hasCycleDFS(node, adj, visited, recStack) {
  visited.add(node);
  recStack.add(node);

  for (const neighbor of adj[node] || []) {
    if (!visited.has(neighbor)) {
      if (hasCycleDFS(neighbor, adj, visited, recStack)) return true;
    } else if (recStack.has(neighbor)) {
      return true;
    }
  }

  recStack.delete(node);
  return false;
}

/**
 * Validate DAG
 */
function validateGraph(nodes, edges) {
  const adj = buildAdjacencyList(edges);
  const visited = new Set();
  const recStack = new Set();

  const nodeIds = nodes.map((n) => n.id);

  for (const nodeId of nodeIds) {
    if (!visited.has(nodeId)) {
      if (hasCycleDFS(nodeId, adj, visited, recStack)) {
        throw new Error("Circular dependency detected in graph");
      }
    }
  }

  edges.forEach((e) => {
    if (!nodeIds.includes(e.source) || !nodeIds.includes(e.target)) {
      throw new Error("Edge references invalid node");
    }
  });

  return true;
}

/**
 * System Prompt
 */
function getSystemPrompt() {
  return `
You are a task extraction engine.

Return ONLY valid JSON:
{
  "nodes": [
    { "id": "string", "label": "string", "description": "string" }
  ],
  "edges": [
    { "source": "string", "target": "string" }
  ]
}


Rules:
- NO circular dependencies under any condition
- Ensure DAG structure strictly
- If unsure, remove dependency instead of creating cycle
`;
}

/**
 * API
 */
app.post("/api/extract-tasks", async (req, res) => {
  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ error: "Description required" });
    }

    const key = hashInput(description);

    // Cache check
    if (cache.has(key)) {
      return res.json({ ...cache.get(key), cached: true });
    }

    let parsed = null;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const response = await openai.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: getSystemPrompt() },
            { role: "user", content: description },
          ],
          temperature: 0.2,
        });

        let content = response.choices[0].message.content;
        const match = content.match(/\{[\s\S]*\}/);

        if (!match) {
          attempts++;
          continue;
        }

        parsed = JSON.parse(match[0]);

        // Validate graph
        validateGraph(parsed.nodes, parsed.edges);

        break; // ✅ success
      } catch (err) {
        attempts++;
        parsed = null;
      }
    }

    if (!parsed) {
      return res.status(400).json({
        error: "Failed to generate valid task graph after multiple attempts.",
      });
    }

    // Cache result
    cache.set(key, parsed);

    res.json({ ...parsed, cached: false });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Health check
 */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", cacheSize: cache.size });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});