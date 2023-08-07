const DEFAULT_CATEGORY_ALIAS = 'default';

const CATEGORIES = {
  'names': {
    order: 10,
    words: new Set([
      'julia', 'stella', 'lea', 'newton', 'mommy', 'daddy', 'minimo',
      'busybee', 'mario', 'yoshi', 'blippi',
    ]),
  },
  'adj': {
    order: 30,
    words: new Set([
      'silly', 'hungry', 'adventurous', 'athletic', 'cranky',
      'curious', 'delicious', 'happy', 'mean', 'nice', 'poopy',
      'sad', 'tasty', 'wonderful', 'yummy',
    ]),
  },
  'colors': {
    order: 40,
    words: new Set([
      'blue', 'green', 'orange', 'pink', 'red', 'yellow',
    ]),
  },
  'verbs': {
    order: 20,
    words: new Set([
      'is', 'are', 'can', 'eat', 'have', 'play', 'take', 'with',
      'hide'
    ]),
  },
  [DEFAULT_CATEGORY_ALIAS]: {
    order: 100,
    words: new Set([]),
  },
};


class CategoryData {
  constructor(data, defaultCategoryAlias) {
    this.data = data;
    this.defaultCategoryAlias = defaultCategoryAlias;
  }

  wordToCategory(word) {
    for (let entry of Object.entries(this.data)) {
      let [alias, {words}] = entry;
      if(words.has(word)) {
        return alias;
      }
    }
    return this.defaultCategoryAlias;
  }

  sortCategories(catAliases) {
    return catAliases.sort((a, b) => {
      return this.data[a].order < this.data[b].order ? -1 : 1;
    });
  }
  getSortedCategories() {
    return Object.entries(this.data)
      .map(entry => ({key: entry[0], order: entry[1].order}))
      .sort((a, b) => a.order < b.order ? -1 : 1)
      .map((entry) => entry.key);
  }

}

let instance = new CategoryData(CATEGORIES, DEFAULT_CATEGORY_ALIAS);
export default instance;
