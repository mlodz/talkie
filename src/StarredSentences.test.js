import {
  STORAGE_KEY,
  isStarred,
  loadStarred,
  parseStarred,
  removeStarred,
  saveStarred,
  sentenceKey,
  toggleStarred,
} from './StarredSentences';

const KNOWN_ALIASES = [
  'julia-says-daddy', 'julia-says-is', 'lea-says-happy', 'lea-says-pizza',
  'julia-says-mommy', 'julia-says-wonderful',
];
const isKnownAlias = alias => KNOWN_ALIASES.includes(alias);

const aSentence = (aliases, savedAt = 1) => ({aliases, savedAt});
const DADDY_IS_HAPPY = ['julia-says-daddy', 'julia-says-is', 'lea-says-happy'];
const PIZZA = ['lea-says-pizza'];
const MOMMY_IS_WONDERFUL = ['julia-says-mommy', 'julia-says-is', 'julia-says-wonderful'];

function aFakeStorage(initial = {}) {
  const items = {...initial};
  return {
    getItem: key => (key in items ? items[key] : null),
    setItem: (key, value) => { items[key] = value; },
  };
}

function aThrowingStorage() {
  const fail = () => { throw new Error('storage unavailable'); };
  return {getItem: fail, setItem: fail};
}

describe('toggleStarred', () => {
  test('adds a new sentence at the front', () => {
    const starred = [aSentence(PIZZA)];

    const result = toggleStarred(starred, DADDY_IS_HAPPY, 99);

    expect(result).toEqual([aSentence(DADDY_IS_HAPPY, 99), aSentence(PIZZA)]);
  });

  test('removes a sentence that is already starred', () => {
    const starred = [aSentence(DADDY_IS_HAPPY), aSentence(PIZZA)];

    expect(toggleStarred(starred, DADDY_IS_HAPPY)).toEqual([aSentence(PIZZA)]);
  });

  test('ignores an empty sentence', () => {
    const starred = [aSentence(PIZZA)];

    expect(toggleStarred(starred, [])).toBe(starred);
  });

  test('treats the same words in a different order as a different sentence', () => {
    const starred = [aSentence(['julia-says-daddy', 'julia-says-is'])];

    expect(isStarred(starred, ['julia-says-is', 'julia-says-daddy'])).toBe(false);
  });
});

describe('removeStarred', () => {
  test('removes only the matching sentence', () => {
    const starred = [aSentence(DADDY_IS_HAPPY), aSentence(PIZZA)];

    expect(removeStarred(starred, PIZZA)).toEqual([aSentence(DADDY_IS_HAPPY)]);
  });
});

describe('parseStarred', () => {
  test('returns an empty list for invalid json', () => {
    expect(parseStarred('{oops', isKnownAlias)).toEqual([]);
  });

  test('returns an empty list when the stored value is not an array', () => {
    expect(parseStarred('{"aliases": []}', isKnownAlias)).toEqual([]);
  });

  test('returns an empty list when nothing is stored', () => {
    expect(parseStarred(null, isKnownAlias)).toEqual([]);
  });

  test('drops a sentence containing a word that no longer exists', () => {
    const stored = JSON.stringify([
      aSentence(['julia-says-daddy', 'julia-says-gone']),
      aSentence(PIZZA),
    ]);

    expect(parseStarred(stored, isKnownAlias)).toEqual([aSentence(PIZZA)]);
  });

  test('drops malformed entries', () => {
    const stored = JSON.stringify([null, 'text', {aliases: 'nope'}, {aliases: []}, {aliases: [3]}, aSentence(PIZZA)]);

    expect(parseStarred(stored, isKnownAlias)).toEqual([aSentence(PIZZA)]);
  });

  test('drops duplicate sentences', () => {
    const stored = JSON.stringify([aSentence(PIZZA, 2), aSentence(PIZZA, 1)]);

    expect(parseStarred(stored, isKnownAlias)).toEqual([aSentence(PIZZA, 2)]);
  });
});

describe('loadStarred and saveStarred', () => {
  test('round trips through storage', () => {
    const storage = aFakeStorage();
    const starred = [aSentence(DADDY_IS_HAPPY, 5), aSentence(PIZZA, 4)];

    saveStarred(storage, starred);

    expect(loadStarred(storage, isKnownAlias)).toEqual(starred);
  });

  test('stores the list under the versioned key', () => {
    const storage = aFakeStorage();

    saveStarred(storage, [aSentence(PIZZA)]);

    expect(JSON.parse(storage.getItem(STORAGE_KEY))).toEqual([aSentence(PIZZA)]);
  });

  test('starts with the default sentence when nothing has been saved', () => {
    expect(loadStarred(aFakeStorage(), isKnownAlias)).toEqual([aSentence(MOMMY_IS_WONDERFUL, 0)]);
  });

  test('keeps the list empty once the user has removed everything', () => {
    const storage = aFakeStorage();

    saveStarred(storage, []);

    expect(loadStarred(storage, isKnownAlias)).toEqual([]);
  });

  test('keeps the saved list without adding the default', () => {
    const storage = aFakeStorage();

    saveStarred(storage, [aSentence(PIZZA)]);

    expect(loadStarred(storage, isKnownAlias)).toEqual([aSentence(PIZZA)]);
  });

  test('falls back to the default sentence when storage is missing or reading throws', () => {
    const defaults = [aSentence(MOMMY_IS_WONDERFUL, 0)];

    expect(loadStarred(null, isKnownAlias)).toEqual(defaults);
    expect(loadStarred(aThrowingStorage(), isKnownAlias)).toEqual(defaults);
  });

  test('leaves out the default sentence when its words no longer exist', () => {
    expect(loadStarred(aFakeStorage(), () => false)).toEqual([]);
  });

  test('does not throw when writing fails', () => {
    expect(() => saveStarred(aThrowingStorage(), [aSentence(PIZZA)])).not.toThrow();
  });
});

describe('sentenceKey', () => {
  test('joins aliases in order', () => {
    expect(sentenceKey(DADDY_IS_HAPPY)).toBe('julia-says-daddy|julia-says-is|lea-says-happy');
  });
});
