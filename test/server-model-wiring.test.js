'use strict';

/**
 * Static wiring checks for server.js.
 *
 * server.js is a top-level script (it opens ChromaDB / SQLite and calls
 * app.listen on load) and exports nothing, so its LLM call sites cannot be
 * imported. These tests read the source instead and pin the contract that
 * every OpenAI call takes its model from lib/llm-config.js and never sends the
 * legacy `max_tokens` parameter, which the gpt-5.x family rejects.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const SERVER = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
const OPENAI_URL = 'https://api.openai.com/v1/';

/**
 * Return the source from `marker` up to and including the first OpenAI
 * request that follows it (through its `timeout:` option), so we can assert
 * on the body of that specific call.
 */
function callWindow(marker) {
  const start = SERVER.indexOf(marker);
  assert.ok(start >= 0, `marker not found in server.js: ${marker}`);
  const url = SERVER.indexOf(OPENAI_URL, start);
  assert.ok(url >= 0, `no OpenAI call after marker: ${marker}`);
  const end = SERVER.indexOf('timeout:', url);
  assert.ok(end >= 0, `no timeout option after OpenAI call for: ${marker}`);
  return SERVER.slice(start, end);
}

test('server.js resolves every model through lib/llm-config', () => {
  assert.match(SERVER, /require\('\.\/lib\/llm-config'\)/);
  assert.match(SERVER, /const LLM_MODELS = resolveLlmModels\(\);/);
  assert.match(SERVER, /const CHAT_MODEL = LLM_MODELS\.chat;/);
  assert.match(SERVER, /const QUERY_CONDENSING_MODEL = LLM_MODELS\.queryCondensing;/);
  assert.match(SERVER, /const AUTHORING_MODEL = LLM_MODELS\.authoring;/);
  assert.match(SERVER, /const EMBEDDING_MODEL = LLM_MODELS\.embedding;/);
});

test('server.js hard-codes no OpenAI model names', () => {
  assert.doesNotMatch(SERVER, /['"`]gpt-[0-9]/, 'model literal found in server.js');
  assert.doesNotMatch(SERVER, /['"`]text-embedding-/, 'embedding model literal found in server.js');
});

test('no chat-completion call sends the legacy max_tokens parameter', () => {
  assert.doesNotMatch(SERVER, /\bmax_tokens\s*:/);
});

test('every chat-completion request body is built by chatCompletionBody', () => {
  const chatCalls = SERVER.split(`${OPENAI_URL}chat/completions`).length - 1;
  const helperCalls = SERVER.split('chatCompletionBody(').length - 1;
  assert.equal(chatCalls, 4, 'expected exactly four chat-completion call sites');
  assert.equal(helperCalls, chatCalls);
});

test('chatbot answer generation uses CHAT_MODEL', () => {
  const w = callWindow('async function generateAIResponse(');
  assert.match(w, /model:\s*CHAT_MODEL\b/);
  assert.doesNotMatch(w, /QUERY_CONDENSING_MODEL|AUTHORING_MODEL/);
});

test('query condensing uses QUERY_CONDENSING_MODEL, not the chat model', () => {
  const w = callWindow('async function condenseQueryForRetrieval(');
  assert.match(w, /model:\s*QUERY_CONDENSING_MODEL\b/);
  assert.doesNotMatch(w, /model:\s*CHAT_MODEL\b/);
  // The prompt itself is unchanged.
  assert.match(w, /Rewrite the latest user message as one standalone question about SmartWinnr/);
});

test('authoring generate / refine uses AUTHORING_MODEL', () => {
  const w = callWindow('async function generateHandler(');
  assert.match(w, /model:\s*AUTHORING_MODEL\b/);
  assert.doesNotMatch(w, /model:\s*CHAT_MODEL\b/);
});

test('authoring field regeneration uses AUTHORING_MODEL', () => {
  const w = callWindow("app.post('/api/admin/authoring/suggest-field'");
  assert.match(w, /model:\s*AUTHORING_MODEL\b/);
  assert.doesNotMatch(w, /model:\s*CHAT_MODEL\b/);
});

test('embeddings continue to use EMBEDDING_MODEL', () => {
  const w = callWindow("app.post('/api/vector/embed'");
  assert.match(w, /embeddings/);
  assert.match(w, /model:\s*EMBEDDING_MODEL\b/);
});

test('the indexer reads the same EMBEDDING_MODEL variable with the same default', () => {
  const indexer = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'internal-indexer.js'), 'utf8');
  assert.match(indexer, /process\.env\.EMBEDDING_MODEL \|\| 'text-embedding-3-small'/);
});

test('boot log reports the configured models', () => {
  assert.match(SERVER, /describeLlmModels\(LLM_MODELS\)/);
});
