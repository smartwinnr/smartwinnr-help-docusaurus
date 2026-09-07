'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  MODEL_DEFAULTS,
  ENV_KEYS,
  resolveLlmModels,
  chatCompletionBody,
  describeLlmModels,
} = require('../lib/llm-config');

test('defaults match the HelpSite model strategy', () => {
  assert.deepEqual(resolveLlmModels({}), {
    chat: 'gpt-5.4-mini',
    queryCondensing: 'gpt-5.4-nano',
    authoring: 'gpt-5.4-mini',
    embedding: 'text-embedding-3-small',
  });
  assert.deepEqual(resolveLlmModels({}), { ...MODEL_DEFAULTS });
});

test('each env var overrides only its own concern', () => {
  const base = resolveLlmModels({});

  const chat = resolveLlmModels({ CHAT_MODEL: 'gpt-5.4' });
  assert.equal(chat.chat, 'gpt-5.4');
  assert.equal(chat.queryCondensing, base.queryCondensing);
  assert.equal(chat.authoring, base.authoring);
  assert.equal(chat.embedding, base.embedding);

  const condense = resolveLlmModels({ QUERY_CONDENSING_MODEL: 'gpt-5.4-mini' });
  assert.equal(condense.queryCondensing, 'gpt-5.4-mini');
  assert.equal(condense.chat, base.chat);

  const authoring = resolveLlmModels({ AUTHORING_MODEL: 'gpt-5.4' });
  assert.equal(authoring.authoring, 'gpt-5.4');
  assert.equal(authoring.chat, base.chat);

  const embedding = resolveLlmModels({ EMBEDDING_MODEL: 'text-embedding-3-large' });
  assert.equal(embedding.embedding, 'text-embedding-3-large');
  assert.equal(embedding.chat, base.chat);
});

test('query condensing is independent of the chat model', () => {
  const m = resolveLlmModels({ CHAT_MODEL: 'gpt-5.4' });
  assert.equal(m.queryCondensing, MODEL_DEFAULTS.queryCondensing);
});

test('blank or whitespace values fall back to the default', () => {
  const m = resolveLlmModels({
    CHAT_MODEL: '',
    QUERY_CONDENSING_MODEL: '   ',
    AUTHORING_MODEL: '\t',
    EMBEDDING_MODEL: '',
  });
  assert.deepEqual(m, { ...MODEL_DEFAULTS });
});

test('values are trimmed', () => {
  assert.equal(resolveLlmModels({ CHAT_MODEL: '  gpt-5.4-nano \n' }).chat, 'gpt-5.4-nano');
});

test('env key names are the documented ones', () => {
  assert.deepEqual(ENV_KEYS, {
    chat: 'CHAT_MODEL',
    queryCondensing: 'QUERY_CONDENSING_MODEL',
    authoring: 'AUTHORING_MODEL',
    embedding: 'EMBEDDING_MODEL',
  });
});

test('chatCompletionBody uses max_completion_tokens, never max_tokens', () => {
  const messages = [{ role: 'user', content: 'hi' }];
  const body = chatCompletionBody({ model: 'gpt-5.4-mini', messages, temperature: 0.5, maxOutputTokens: 750 });
  assert.deepEqual(body, {
    model: 'gpt-5.4-mini',
    messages,
    temperature: 0.5,
    max_completion_tokens: 750,
  });
  assert.equal('max_tokens' in body, false);
  assert.equal('reasoning_effort' in body, false);
});

test('chatCompletionBody omits undefined optional fields', () => {
  const body = chatCompletionBody({ model: 'm', messages: [] });
  assert.deepEqual(body, { model: 'm', messages: [] });
  const zero = chatCompletionBody({ model: 'm', messages: [], temperature: 0, maxOutputTokens: 0 });
  assert.equal(zero.temperature, 0);
  assert.equal(zero.max_completion_tokens, 0);
});

test('chatCompletionBody rejects missing model or messages', () => {
  assert.throws(() => chatCompletionBody({ messages: [] }), /model is required/);
  assert.throws(() => chatCompletionBody({ model: 'm' }), /messages must be an array/);
});

test('describeLlmModels names every concern and contains no secrets', () => {
  const line = describeLlmModels(resolveLlmModels({}));
  assert.match(line, /chat model: gpt-5\.4-mini/);
  assert.match(line, /query condensing model: gpt-5\.4-nano/);
  assert.match(line, /authoring model: gpt-5\.4-mini/);
  assert.match(line, /embedding model: text-embedding-3-small/);
  assert.doesNotMatch(line, /sk-|key/i);
});
