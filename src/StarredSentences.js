const STORAGE_KEY = 'talkie.starred.v1';

const DEFAULT_STARRED = [
  {aliases: ['julia-says-mommy', 'julia-says-is', 'julia-says-wonderful'], savedAt: 0},
];

function sentenceKey(aliases) {
  return aliases.join('|');
}

function isStarred(starred, aliases) {
  const key = sentenceKey(aliases);
  return starred.some(sentence => sentenceKey(sentence.aliases) === key);
}

function removeStarred(starred, aliases) {
  const key = sentenceKey(aliases);
  return starred.filter(sentence => sentenceKey(sentence.aliases) !== key);
}

function toggleStarred(starred, aliases, savedAt = Date.now()) {
  if (aliases.length === 0) {
    return starred;
  }
  if (isStarred(starred, aliases)) {
    return removeStarred(starred, aliases);
  }
  return [{aliases: [...aliases], savedAt}, ...starred];
}

// A sentence missing a word would say something different, so any unknown alias drops the whole sentence.
function parseStarred(rawJson, isKnownAlias) {
  let parsed;
  try {
    parsed = JSON.parse(rawJson);
  } catch (e) {
    return [];
  }
  if (!Array.isArray(parsed)) {
    return [];
  }

  const isUsable = sentence =>
    Boolean(sentence) &&
    Array.isArray(sentence.aliases) &&
    sentence.aliases.length > 0 &&
    sentence.aliases.every(alias => typeof alias === 'string' && isKnownAlias(alias));

  const seenKeys = new Set();
  const isFirstSighting = sentence => {
    const key = sentenceKey(sentence.aliases);
    if (seenKeys.has(key)) {
      return false;
    }
    seenKeys.add(key);
    return true;
  };

  return parsed
    .filter(isUsable)
    .filter(isFirstSighting)
    .map(({aliases, savedAt}) => ({aliases: [...aliases], savedAt: Number(savedAt) || 0}));
}

// Reading window.localStorage itself can throw when storage is blocked.
function browserStorage() {
  try {
    return window.localStorage;
  } catch (e) {
    return null;
  }
}

function defaultStarred(isKnownAlias) {
  return parseStarred(JSON.stringify(DEFAULT_STARRED), isKnownAlias);
}

// Only a never-saved list gets the defaults; a list the user emptied is stored as "[]" and stays empty.
function loadStarred(storage, isKnownAlias) {
  try {
    const rawJson = storage && storage.getItem(STORAGE_KEY);
    return rawJson ? parseStarred(rawJson, isKnownAlias) : defaultStarred(isKnownAlias);
  } catch (e) {
    return defaultStarred(isKnownAlias);
  }
}

// Private browsing and a full disk both throw; starring still works for the session.
function saveStarred(storage, starred) {
  if (!storage) {
    return;
  }
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(starred));
  } catch (e) {
    // intentionally ignored
  }
}

export {
  STORAGE_KEY,
  sentenceKey,
  isStarred,
  removeStarred,
  toggleStarred,
  parseStarred,
  browserStorage,
  loadStarred,
  saveStarred,
};
