'use strict';

/**
 * Runtime LLM model selection for the help site.
 *
 * Every model name the server sends to OpenAI is resolved here from the
 * environment, so a model change never needs a code change. Four concerns
 * are configured independently:
 *
 *   CHAT_MODEL              Ally chatbot answer generation (RAG answer + citations)
 *   QUERY_CONDENSING_MODEL  Rewrites a conversational follow-up into a standalone
 *                           retrieval query (small, cheap call; no user-visible text)
 *   AUTHORING_MODEL         Authoring wizard: article generate / refine and
 *                           single-field regeneration (title, description)
 *   EMBEDDING_MODEL         /api/vector/embed, the indexer, and the search bar.
 *                           Changing this requires re-embedding the whole corpus.
 *
 * Offline maintenance scripts (scripts/rewrite-articles.js, scripts/freshdesk/*)
 * pick their own models and are intentionally NOT covered here.
 */

const MODEL_DEFAULTS = Object.freeze({
  chat: 'gpt-5.4-mini',
  queryCondensing: 'gpt-5.4-nano',
  authoring: 'gpt-5.4-mini',
  embedding: 'text-embedding-3-small',
});

const ENV_KEYS = Object.freeze({
  chat: 'CHAT_MODEL',
  queryCondensing: 'QUERY_CONDENSING_MODEL',
  authoring: 'AUTHORING_MODEL',
  embedding: 'EMBEDDING_MODEL',
});

function pick(env, key, fallback) {
  const raw = env ? env[key] : undefined;
  if (typeof raw !== 'string') return fallback;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

/**
 * Resolve the four model names from an environment object (defaults to
 * process.env). Blank or whitespace-only values fall back to the default.
 */
function resolveLlmModels(env = process.env) {
  return {
    chat: pick(env, ENV_KEYS.chat, MODEL_DEFAULTS.chat),
    queryCondensing: pick(env, ENV_KEYS.queryCondensing, MODEL_DEFAULTS.queryCondensing),
    authoring: pick(env, ENV_KEYS.authoring, MODEL_DEFAULTS.authoring),
    embedding: pick(env, ENV_KEYS.embedding, MODEL_DEFAULTS.embedding),
  };
}

/**
 * Build a Chat Completions request body.
 *
 * The gpt-5.x family rejects the legacy `max_tokens` parameter (HTTP 400
 * "Unsupported parameter") and requires `max_completion_tokens`, which the
 * gpt-4o family also accepts. This is the single place that encodes that
 * rename so no call site carries a model-specific parameter name.
 *
 * `temperature` is passed through as given. The gpt-5.4 models accept it at
 * their default reasoning effort (`none`); `reasoning_effort` is deliberately
 * not sent so older models that reject the field keep working.
 */
function chatCompletionBody({ model, messages, temperature, maxOutputTokens }) {
  if (!model) throw new Error('chatCompletionBody: model is required');
  if (!Array.isArray(messages)) throw new Error('chatCompletionBody: messages must be an array');
  const body = { model, messages };
  if (temperature !== undefined) body.temperature = temperature;
  if (maxOutputTokens !== undefined) body.max_completion_tokens = maxOutputTokens;
  return body;
}

/** One-line, secret-free description for the boot log. */
function describeLlmModels(models) {
  return (
    `chat model: ${models.chat}, ` +
    `query condensing model: ${models.queryCondensing}, ` +
    `authoring model: ${models.authoring}, ` +
    `embedding model: ${models.embedding}`
  );
}

module.exports = {
  MODEL_DEFAULTS,
  ENV_KEYS,
  resolveLlmModels,
  chatCompletionBody,
  describeLlmModels,
};
