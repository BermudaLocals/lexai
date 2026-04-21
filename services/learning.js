// LexAI Self-Learning Service
// Tracks user corrections and adapts AI responses over time

const corrections = new Map() // userId -> [{original, corrected, timestamp}]

function recordCorrection(userId, original, corrected) {
  if (!corrections.has(userId)) corrections.set(userId, [])
  corrections.get(userId).push({ original, corrected, timestamp: Date.now() })
  return { success: true, count: corrections.get(userId).length }
}

function getUserPatterns(userId) {
  return corrections.get(userId) || []
}

function buildContextPrompt(userId) {
  const patterns = getUserPatterns(userId)
  if (patterns.length === 0) return ''
  const recent = patterns.slice(-5)
  return `\n\nUser style preferences based on past corrections:\n${recent.map(p => `- Changed "${p.original.slice(0,50)}..." to "${p.corrected.slice(0,50)}..."`).join('\n')}`
}

module.exports = { recordCorrection, getUserPatterns, buildContextPrompt }
