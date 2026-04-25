import { useState } from 'react';
import axios from 'axios';
import Graph from './Graph';

function App() {
  const [description, setDescription] = useState('');
  const [graphData, setGraphData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    setLoading(true);
    setError(null);
    setGraphData(null);
    setSelectedNode(null);

    try {
      const res = await axios.post('/api/extract-tasks', { description });
      setGraphData({
        nodes: res.data.nodes,
        edges: res.data.edges,
        cached: res.data.cached,
      });
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Unknown error';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = (nodeId) => {
    if (!graphData) return;
    const node = graphData.nodes.find((n) => n.id === nodeId);
    setSelectedNode(node || null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">
          AI Task Dependency Manager
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Describe your project and let AI extract tasks and visualize dependencies.
        </p>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel: Input */}
        <div className="w-full lg:w-1/3 p-6 flex flex-col gap-4 border-r border-gray-200 overflow-y-auto">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label htmlFor="description" className="text-sm font-semibold text-gray-700">
              Project Description
            </label>
            <textarea
              id="description"
              rows={6}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
              placeholder="e.g., Build a task management app with user auth, project boards, and real-time notifications..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading || !description.trim()}
              className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                loading || !description.trim()
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Analyzing...' : 'Extract Tasks'}
            </button>
          </form>

          {/* Status / Error */}
          {loading && (
            <div className="flex items-center gap-3 text-blue-600 bg-blue-50 p-3 rounded-lg">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="text-sm font-medium">AI is processing your description...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200">
              <strong className="block mb-1">Error</strong>
              {error}
            </div>
          )}

          {graphData?.cached && (
            <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm border border-green-200">
              Served from cache.
            </div>
          )}

          {/* Selected Node Details */}
          {selectedNode && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">
                Task Details
              </h3>
              <h4 className="text-lg font-semibold text-blue-700 mb-1">
                {selectedNode.label}
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {selectedNode.description}
              </p>
              <div className="mt-3 text-xs text-gray-400 font-mono">
                ID: {selectedNode.id}
              </div>
            </div>
          )}

          {!selectedNode && graphData && (
            <div className="text-sm text-gray-400 italic">
              Click a node in the graph to see its description.
            </div>
          )}
        </div>

        {/* Right Panel: Graph */}
        <div className="flex-1 bg-gray-100 relative">
          {graphData ? (
            <Graph
              nodes={graphData.nodes}
              edges={graphData.edges}
              onNodeClick={handleNodeClick}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                  />
                </svg>
                <p className="text-lg font-medium">No graph to display</p>
                <p className="text-sm">Enter a project description to generate a task dependency graph.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;

