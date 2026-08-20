// services/vectorStore.js
// LexAI Vector Store — file-backed in-memory store with cosine similarity
// Persists to JSON so data survives restarts. Zero external dependencies.

const fs = require('fs');
const path = require('path');

const STORE_PATH = process.env.VECTOR_STORE_PATH || path.join(__dirname, '..', 'data', 'vector-store.json');
let store = { documents: [], version: 1 };

// Load existing store on startup
try {
  if (fs.existsSync(STORE_PATH)) {
    store = JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
    console.log(`[vectorStore] Loaded ${store.documents.length} vectors from ${STORE_PATH}`);
  }
} catch (e) {
  console.error('[vectorStore] Load error (starting fresh):', e.message);
  store = { documents: [], version: 1 };
}

function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function save() {
  try {
    const dir = path.dirname(STORE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
  } catch (e) {
    console.error('[vectorStore] Save error:', e.message);
  }
}

function add(id, vector, metadata = {}) {
  if (!id || !Array.isArray(vector)) throw new Error('add() requires id and vector array');
  const existing = store.documents.findIndex(d => d.id === id);
  const doc = { id, vector, metadata, createdAt: new Date().toISOString() };
  if (existing >= 0) store.documents[existing] = doc;
  else store.documents.push(doc);
  save();
  return doc;
}

function remove(id) {
  store.documents = store.documents.filter(d => d.id !== id);
  save();
}

function search(queryVector, topK = 5, filters = {}) {
  if (!Array.isArray(queryVector)) throw new Error('search() requires a vector array');
  let results = store.documents.map(doc => ({
    ...doc,
    score: cosineSimilarity(queryVector, doc.vector)
  }));

  // Apply metadata filters
  if (filters.jurisdiction) {
    results = results.filter(r => r.metadata?.jurisdiction === filters.jurisdiction);
  }
  if (filters.docType) {
    results = results.filter(r => r.metadata?.docType === filters.docType);
  }
  if (filters.userId) {
    results = results.filter(r => r.metadata?.userId === filters.userId);
  }
  if (filters.sourceId) {
    results = results.filter(r => r.metadata?.sourceId === filters.sourceId);
  }

  return results.sort((a, b) => b.score - a.score).slice(0, topK);
}

function list(filters = {}) {
  let docs = store.documents;
  if (filters.jurisdiction) docs = docs.filter(d => d.metadata?.jurisdiction === filters.jurisdiction);
  if (filters.userId) docs = docs.filter(d => d.metadata?.userId === filters.userId);
  if (filters.sourceId) docs = docs.filter(d => d.metadata?.sourceId === filters.sourceId);
  return docs;
}

function clear() {
  store.documents = [];
  save();
  console.log('[vectorStore] Cleared all vectors');
}

function stats() {
  return {
    totalDocuments: store.documents.length,
    storePath: STORE_PATH,
    version: store.version
  };
}

module.exports = { add, remove, search, list, clear, save, stats };
