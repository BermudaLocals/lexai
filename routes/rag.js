// routes/rag.js
// LexAI RAG API — ingest precedent docs + query with sentence-level citations
// POST /api/rag/ingest  |  POST /api/rag/query  |  GET /api/rag/status

const express = require('express');
const router = express.Router();
const rag = require('../services/rag');
const vectorStore = require('../services/vectorStore');

// POST /api/rag/ingest
router.post('/ingest', async (req, res) => {
  try {
    const { id, text, metadata = {} } = req.body;
    if (!id || !text) {
      return res.status(400).json({ error: 'id and text are required' });
    }
    const result = await rag.ingestDocument({
      id,
      text,
      metadata: { ...metadata, userId: req.user?.id || null }
    });
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[rag] ingest error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/rag/query
router.post('/query', async (req, res) => {
  try {
    const { query, jurisdiction, topK, filters, systemPrompt } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'query is required' });
    }
    const result = await rag.query({ query, jurisdiction, topK, filters, systemPrompt });
    res.json(result);
  } catch (err) {
    console.error('[rag] query error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/rag/status — health + vector count
router.get('/status', (req, res) => {
  res.json({ status: 'ok', service: 'rag', ...vectorStore.stats() });
});

// DELETE /api/rag/clear — wipe all vectors (admin/god mode only)
router.delete('/clear', async (req, res) => {
  try {
    if (req.user?.role !== 'admin' && req.user?.role !== 'god') {
      return res.status(403).json({ error: 'Admin required' });
    }
    vectorStore.clear();
    res.json({ success: true, message: 'Vector store cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
