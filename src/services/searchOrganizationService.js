class SearchOrganizationService {
  constructor() {
    this.searchIndex = {};
    this.tags = new Set();
    this.categories = new Set();
    this.favorites = new Set();
    this.recentlyViewed = [];
    this.maxRecentItems = 50;
  }

  /**
   * Index a paste for search
   * @param {object} paste - Paste object
   */
  indexPaste(paste) {
    const searchableText = [
      paste.title,
      paste.content,
      paste.tags?.join(' ') || '',
      paste.category || '',
      paste.language || ''
    ].join(' ').toLowerCase();

    // Create search tokens
    const tokens = this.tokenize(searchableText);
    
    // Store in search index
    this.searchIndex[paste._id] = {
      paste,
      tokens,
      searchableText,
      indexedAt: new Date().toISOString()
    };

    // Update tags and categories
    if (paste.tags) {
      paste.tags.forEach(tag => this.tags.add(tag));
    }
    if (paste.category) {
      this.categories.add(paste.category);
    }
  }

  /**
   * Remove paste from search index
   * @param {string} pasteId - Paste ID
   */
  removeFromIndex(pasteId) {
    delete this.searchIndex[pasteId];
  }

  /**
   * Tokenize text for search
   * @param {string} text - Text to tokenize
   * @returns {Array} - Array of tokens
   */
  tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 2);
  }

  /**
   * Search pastes with advanced filters
   * @param {object} searchOptions - Search options
   * @returns {Array} - Array of matching pastes
   */
  search(searchOptions = {}) {
    const {
      query = '',
      tags = [],
      category = '',
      language = '',
      dateRange = null,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      limit = null,
      favoritesOnly = false,
      recentOnly = false
    } = searchOptions;

    let results = Object.values(this.searchIndex).map(item => item.paste);

    // Filter by query
    if (query.trim()) {
      const queryTokens = this.tokenize(query);
      results = results.filter(paste => {
        const indexed = this.searchIndex[paste._id];
        if (!indexed) return false;

        return queryTokens.some(token =>
          indexed.tokens.some(indexedToken =>
            indexedToken.includes(token) || token.includes(indexedToken)
          )
        );
      });
    }

    // Filter by tags
    if (tags.length > 0) {
      results = results.filter(paste =>
        tags.some(tag => paste.tags?.includes(tag))
      );
    }

    // Filter by category
    if (category) {
      results = results.filter(paste => paste.category === category);
    }

    // Filter by language
    if (language) {
      results = results.filter(paste => paste.language === language);
    }

    // Filter by date range
    if (dateRange) {
      const { start, end } = dateRange;
      results = results.filter(paste => {
        const pasteDate = new Date(paste.createdAt);
        return (!start || pasteDate >= start) && (!end || pasteDate <= end);
      });
    }

    // Filter favorites only
    if (favoritesOnly) {
      results = results.filter(paste => this.favorites.has(paste._id));
    }

    // Filter recent only
    if (recentOnly) {
      const recentIds = this.recentlyViewed.slice(0, 10);
      results = results.filter(paste => recentIds.includes(paste._id));
    }

    // Sort results
    results.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt || a.createdAt);
          bValue = new Date(b.updatedAt || b.createdAt);
          break;
        case 'viewCount':
          aValue = a.viewCount || 0;
          bValue = b.viewCount || 0;
          break;
        case 'language':
          aValue = a.language || '';
          bValue = b.language || '';
          break;
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Apply limit
    if (limit && limit > 0) {
      results = results.slice(0, limit);
    }

    return results;
  }

  /**
   * Get search suggestions
   * @param {string} query - Partial query
   * @returns {Array} - Array of suggestions
   */
  getSuggestions(query) {
    if (!query.trim()) return [];

    const suggestions = new Set();
    const queryLower = query.toLowerCase();

    // Add matching tags
    this.tags.forEach(tag => {
      if (tag.toLowerCase().includes(queryLower)) {
        suggestions.add(tag);
      }
    });

    // Add matching categories
    this.categories.forEach(category => {
      if (category.toLowerCase().includes(queryLower)) {
        suggestions.add(category);
      }
    });

    // Add matching paste titles
    Object.values(this.searchIndex).forEach(item => {
      if (item.paste.title.toLowerCase().includes(queryLower)) {
        suggestions.add(item.paste.title);
      }
    });

    return Array.from(suggestions).slice(0, 10);
  }

  /**
   * Add paste to favorites
   * @param {string} pasteId - Paste ID
   */
  addToFavorites(pasteId) {
    this.favorites.add(pasteId);
    this.saveFavorites();
  }

  /**
   * Remove paste from favorites
   * @param {string} pasteId - Paste ID
   */
  removeFromFavorites(pasteId) {
    this.favorites.delete(pasteId);
    this.saveFavorites();
  }

  /**
   * Check if paste is favorited
   * @param {string} pasteId - Paste ID
   * @returns {boolean} - True if favorited
   */
  isFavorited(pasteId) {
    return this.favorites.has(pasteId);
  }

  /**
   * Get all favorites
   * @returns {Array} - Array of favorited paste IDs
   */
  getFavorites() {
    return Array.from(this.favorites);
  }

  /**
   * Add paste to recently viewed
   * @param {string} pasteId - Paste ID
   */
  addToRecentlyViewed(pasteId) {
    // Remove if already exists
    this.recentlyViewed = this.recentlyViewed.filter(id => id !== pasteId);
    
    // Add to beginning
    this.recentlyViewed.unshift(pasteId);
    
    // Limit size
    if (this.recentlyViewed.length > this.maxRecentItems) {
      this.recentlyViewed = this.recentlyViewed.slice(0, this.maxRecentItems);
    }

    this.saveRecentlyViewed();
  }

  /**
   * Get recently viewed pastes
   * @param {number} limit - Maximum number to return
   * @returns {Array} - Array of recently viewed paste IDs
   */
  getRecentlyViewed(limit = 10) {
    return this.recentlyViewed.slice(0, limit);
  }

  /**
   * Clear recently viewed
   */
  clearRecentlyViewed() {
    this.recentlyViewed = [];
    this.saveRecentlyViewed();
  }

  /**
   * Get all available tags
   * @returns {Array} - Array of tags
   */
  getAllTags() {
    return Array.from(this.tags).sort();
  }

  /**
   * Get all available categories
   * @returns {Array} - Array of categories
   */
  getAllCategories() {
    return Array.from(this.categories).sort();
  }

  /**
   * Get all available languages
   * @returns {Array} - Array of languages
   */
  getAllLanguages() {
    const languages = new Set();
    Object.values(this.searchIndex).forEach(item => {
      if (item.paste.language) {
        languages.add(item.paste.language);
      }
    });
    return Array.from(languages).sort();
  }

  /**
   * Get paste statistics
   * @returns {object} - Statistics object
   */
  getStats() {
    const totalPastes = Object.keys(this.searchIndex).length;
    const totalTags = this.tags.size;
    const totalCategories = this.categories.size;
    const totalFavorites = this.favorites.size;
    const totalRecent = this.recentlyViewed.length;

    // Language distribution
    const languageStats = {};
    Object.values(this.searchIndex).forEach(item => {
      const lang = item.paste.language || 'Unknown';
      languageStats[lang] = (languageStats[lang] || 0) + 1;
    });

    // Tag usage
    const tagStats = {};
    Object.values(this.searchIndex).forEach(item => {
      if (item.paste.tags) {
        item.paste.tags.forEach(tag => {
          tagStats[tag] = (tagStats[tag] || 0) + 1;
        });
      }
    });

    return {
      totalPastes,
      totalTags,
      totalCategories,
      totalFavorites,
      totalRecent,
      languageStats,
      tagStats
    };
  }

  /**
   * Save favorites to localStorage
   */
  saveFavorites() {
    try {
      localStorage.setItem('pasteApp_favorites', JSON.stringify(Array.from(this.favorites)));
    } catch (error) {
      console.error('Failed to save favorites:', error);
    }
  }

  /**
   * Load favorites from localStorage
   */
  loadFavorites() {
    try {
      const saved = localStorage.getItem('pasteApp_favorites');
      if (saved) {
        this.favorites = new Set(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  }

  /**
   * Save recently viewed to localStorage
   */
  saveRecentlyViewed() {
    try {
      localStorage.setItem('pasteApp_recentlyViewed', JSON.stringify(this.recentlyViewed));
    } catch (error) {
      console.error('Failed to save recently viewed:', error);
    }
  }

  /**
   * Load recently viewed from localStorage
   */
  loadRecentlyViewed() {
    try {
      const saved = localStorage.getItem('pasteApp_recentlyViewed');
      if (saved) {
        this.recentlyViewed = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load recently viewed:', error);
    }
  }

  /**
   * Initialize service with existing data
   * @param {Array} pastes - Array of pastes
   */
  initialize(pastes) {
    // Load saved data
    this.loadFavorites();
    this.loadRecentlyViewed();

    // Index all pastes
    pastes.forEach(paste => this.indexPaste(paste));
  }

  /**
   * Export search data
   * @returns {object} - Exportable data
   */
  exportData() {
    return {
      favorites: Array.from(this.favorites),
      recentlyViewed: this.recentlyViewed,
      tags: Array.from(this.tags),
      categories: Array.from(this.categories)
    };
  }

  /**
   * Import search data
   * @param {object} data - Importable data
   */
  importData(data) {
    if (data.favorites) {
      this.favorites = new Set(data.favorites);
      this.saveFavorites();
    }
    if (data.recentlyViewed) {
      this.recentlyViewed = data.recentlyViewed;
      this.saveRecentlyViewed();
    }
    if (data.tags) {
      this.tags = new Set(data.tags);
    }
    if (data.categories) {
      this.categories = new Set(data.categories);
    }
  }
}

export default new SearchOrganizationService();
