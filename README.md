<img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/3ae17ac7-80c0-4937-9232-54da813b7bfc" /><img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/10227a0e-d1f5-4d20-8baf-bdfb67bf8e4a" />The AI-Powered Task Dependency Manager is a full-stack application designed to convert a high-level project description into a structured task dependency graph. The system leverages a Large Language Model (LLM) to automatically extract tasks and their relationships, ensuring a logical and valid execution flow.
The generated tasks are visualized using an interactive graph interface, allowing users to understand project structure and dependencies intuitively.

System Architecture
User Input (Frontend - React)
        ↓
API Request (/api/extract-tasks)
        ↓
Backend (Node.js + Express)
        ↓
LLM (Groq API - LLaMA Model)
        ↓
Task JSON (nodes + edges)
        ↓
Validation Layer (DFS Cycle Detection)
        ↓
Cache Storage (Map)
        ↓
Response to Frontend
        ↓
Graph Visualization (React Flow)

Tech Stack
🔹 Frontend
React.js
Tailwind CSS
React Flow (graph visualization)
🔹 Backend
Node.js
Express.js
🔹 AI Integration
Groq API (LLaMA 3.1 model)
🔹 Other Tools
dotenv (environment variables)
crypto (hashing for caching)

# Core Features

<img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/e436c30c-d65e-4afb-9702-15c842c8ab11" />


1. AI-Based Task Extraction
Converts project description into structured tasks
Uses LLM to generate nodes and dependencies
2. Dependency Graph Generation
Tasks are represented as nodes
Dependencies are represented as edges
3. Cycle Detection (DFS Algorithm)
Ensures graph is a Directed Acyclic Graph (DAG)
Prevents circular dependencies
4. Retry Mechanism (Self-Healing AI)
If AI generates invalid graph → system retries
Ensures valid output without user intervention
5. Caching System
Uses SHA-256 hashing
Prevents repeated API calls for same input
6. Interactive Visualization
Drag-and-drop nodes
Click to view task details
Real-time graph rendering

#Algorithm Used
🔹 Depth-First Search (DFS) for Cycle Detection

The system uses DFS to detect cycles in the dependency graph.

Steps:
-Traverse each node
-Maintain:
-visited set
-recStack (recursion stack)
-If a node is revisited in recursion stack → cycle detected

# API Endpoints
🔹 POST /api/extract-tasks

Input:

{
  "description": "Build a food delivery app"
}

Output:

{
  "nodes": [...],
  "edges": [...],
  "cached": false
}
🔹 GET /api/health

Output:

{
  "status": "ok",
  "cacheSize": 5
}
# Environment Configuration

Create a .env file:

GROQ_API_KEY=your_api_key_here
# How to Run the Project
Step 1: Install dependencies
npm install
cd client
npm install
Step 2: Run backend
node server.js
Step 3: Run frontend
cd client
npm run dev
Step 4: Open browser
http://localhost:5173
# Challenges Faced
Handling inconsistent AI outputs
Ensuring strict JSON parsing
Preventing circular dependencies
Managing API quota limitations
Synchronizing frontend and backend communication
# Future Scope
Multi-agent architecture (planner + validator + fixer)
Real-time streaming responses
Persistent database storage
User authentication and project saving
Advanced graph layouts and analytics
# Conclusion

This project successfully demonstrates how AI can be integrated with traditional system design principles to automate task planning and visualization. 
By combining LLM capabilities with graph algorithms and frontend interactivity, the system provides a scalable and intelligent solution for project management.
