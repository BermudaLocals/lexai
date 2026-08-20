// services/rag.js
// LexAI RAG Engine — chunk, embed, retrieve, cite
// Harvey-level: sentence-level citations grounded in your precedent library

const { embed } = require('./embeddings');
const vectorStore = require('./vectorStore');
const { callAI } = require('./ai');

const CHUNK_SIZE = 512;
const CHUNK_OVERLAP = 64;

function chunkText(text, size = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
  if (!text) return [];
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + size, text.length);
    let breakPoint = end;
    if (end < text.length) {
      const searchText = text.slice(start, end + 20);
      const lastPeriod = searchText.lastIndexOf('. ');
      const lastNewline = searchText.lastIndexOf('\n');
      const bestBreak = Math.max(lastPeriod, lastNewline);
      if (bestBreak > size * 0.5) breakPoint = start + bestBreak + 1;
    }
    chunks.push(text.slice(start, breakPoint).trim());
    const nextStart = breakPoint - overlap;
    if (nextStart <= start) start = breakPoint; // prevent infinite loop
    else start = nextStart;
  }
  return chunks.filter(c => c.length > 20);
}

async function ingestDocument({ id, text, metadata = {} }) {
  if (!id || !text) throw new Error('ingestDocument requires id and text');
  const chunks = chunkText(text);
  const embeddings = [];
  for (let i = 0; i < chunks.length; i++) {
    const vector = await embed(chunks[i]);
    const chunkId = `${id}::chunk-${i}`;
    vectorStore.add(chunkId, vector, {
      ...metadata,
      sourceId: id,
      chunkIndex: i,
      text: chunks[i],
      totalChunks: chunks.length
    });
    embeddings.push({ chunkId, textPreview: chunks[i].slice(0, 80) });
  }
  return { id, chunksIngested: chunks.length, chunkIds: embeddings.map(e => e.chunkId) };
}

async function query({ query, jurisdiction, topK = 5, filters = {}, systemPrompt }) {
  if (!query) throw new Error('query is required');
  const queryVector = await embed(query);
  const searchFilters = { ...filters };
  if (jurisdiction) searchFilters.jurisdiction = jurisdiction;

  const results = vectorStore.search(queryVector, topK, searchFilters);
  if (results.length === 0) {
    return { answer: 'No relevant documents found in the knowledge base for this query.', sources: [] };
  }

  // Build context with citation markers
  const contextParts = results.map((r, i) => {
    return `[Source ${i + 1}] (Relevance: ${(r.score * 100).toFixed(1)}%)\n${r.metadata.text}`;
  });
  const context = contextParts.join('\n\n---\n\n');

  const prompt = `Use the following retrieved sources to answer the legal question. 
Cite EVERY claim you make using [Source N] format. 
If the sources do not contain enough information to answer, say so clearly and recommend next steps.

RETREIVED SOURCES:
${context}

QUESTION: ${query}

Provide a detailed, professional answer with sentence-level citations:`;

  const answer = await callAI({
    system: systemPrompt || 'You are LexAI, a senior legal research assistant. Cite every factual claim with [Source N]. If uncertain, say so.',
    prompt,
    maxTokens: 4096,
    temperature: 0.2
  });

  // Parse which sources were actually cited
  const citedSources = [];
  const sourceRegex = /\[Source (\d+)\]/g;
  let match;
  while ((match = sourceRegex.exec(answer)) !== null) {
    const idx = parseInt(match[1]) - 1;
    if (results[idx] && !citedSources.find(s => s.id === results[idx].id)) {
      citedSources.push({
        id: results[idx].id,
        score: results[idx].score,
        text: results[idx].metadata.text?.slice(0, 200) + '...',
        metadata: results[idx].metadata
      });
    }
  }

  return { answer, sources: citedSources, retrievedCount: results.length };
}

module.exports = { ingestDocument, query, chunkText };
