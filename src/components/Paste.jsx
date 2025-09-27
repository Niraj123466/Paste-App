import { useState, useMemo, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FixedSizeList as List } from "react-window";
import useDebounce from "./useDebounce";
import { NavLink, useNavigate } from "react-router-dom";
import { 
  removeFromPaste, 
  setSearchQuery, 
  setSearchFilters, 
  setSortOptions,
  toggleFavorite,
  incrementViewCount,
  initializeServices
} from "../features/paste/pasteSlice";
import toast from "react-hot-toast";
import syntaxHighlightingService from "../services/syntaxHighlightingService.jsx";
import expiryService from "../services/expiryService";
import searchOrganizationService from "../services/searchOrganizationService";

function Paste() {
  const pastes = useSelector((state) => state.paste?.pastes || []);
  const searchQuery = useSelector((state) => state.paste?.searchQuery || "");
  const searchFilters = useSelector((state) => state.paste?.searchFilters || {});
  const sortOptions = useSelector((state) => state.paste?.sortOptions || {});
  const [sharedLinks, setSharedLinks] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const searchRef = useRef(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Initialize services on component mount
  useEffect(() => {
    dispatch(initializeServices());
  }, [dispatch]);

  const filterPastes = useMemo(() => {
    // Simple filtering without using the service directly
    let filtered = pastes;

    // Filter by search query
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(paste =>
        paste.title.toLowerCase().includes(query) ||
        paste.content.toLowerCase().includes(query) ||
        (paste.tags && paste.tags.some(tag => tag.toLowerCase().includes(query))) ||
        (paste.category && paste.category.toLowerCase().includes(query)) ||
        (paste.language && paste.language.toLowerCase().includes(query))
      );
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(paste =>
        selectedTags.some(tag => paste.tags?.includes(tag))
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(paste => paste.category === selectedCategory);
    }

    // Filter by language
    if (selectedLanguage) {
      filtered = filtered.filter(paste => paste.language === selectedLanguage);
    }

    // Sort results (create new array to avoid mutating read-only array)
    const sorted = [...filtered].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortOptions.sortBy) {
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

      if (sortOptions.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return sorted;
  }, [pastes, debouncedSearchQuery, selectedTags, selectedCategory, selectedLanguage, sortOptions]);

  const formatDate = (dateString) => new Date(dateString).toLocaleString();

  const handleSearchChange = (e) => {
    dispatch(setSearchQuery(e.target.value));
  };

  const handleTagToggle = (tag) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    dispatch(setSearchFilters({ tags: newTags }));
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    dispatch(setSearchFilters({ category }));
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    dispatch(setSearchFilters({ language }));
  };

  const handleSortChange = (sortBy) => {
    const newSortOrder = sortOptions.sortBy === sortBy && sortOptions.sortOrder === 'desc' ? 'asc' : 'desc';
    dispatch(setSortOptions({ sortBy, sortOrder: newSortOrder }));
  };

  const handleFavoriteToggle = (pasteId) => {
    dispatch(toggleFavorite(pasteId));
  };

  const isFavorited = (pasteId) => {
    try {
      return searchOrganizationService.isFavorited(pasteId);
    } catch (error) {
      // Fallback to localStorage if service fails
      const favorites = JSON.parse(localStorage.getItem('pasteApp_favorites') || '[]');
      return favorites.includes(pasteId);
    }
  };

  const handleViewPaste = (pasteId) => {
    dispatch(incrementViewCount(pasteId));
    navigate(`/pastes/${pasteId}`);
  };

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === '/') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleShare = (pasteId) => {
    const sharableLink = `${window.location.origin}/pastes/${pasteId}`;
    setSharedLinks((prev) => ({
      ...prev,
      [pasteId]: sharableLink,
    }));
  };

  const availableTags = useMemo(() => {
    const tags = new Set();
    pastes.forEach(paste => {
      if (paste.tags) {
        paste.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }, [pastes]);

  const availableCategories = useMemo(() => {
    const categories = new Set();
    pastes.forEach(paste => {
      if (paste.category) {
        categories.add(paste.category);
      }
    });
    return Array.from(categories).sort();
  }, [pastes]);

  const availableLanguages = useMemo(() => {
    const languages = new Set();
    pastes.forEach(paste => {
      if (paste.language) {
        languages.add(paste.language);
      }
    });
    return Array.from(languages).sort();
  }, [pastes]);

  return (
    <section className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Your Pastes</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <input
            type="search"
            placeholder="Search pastes..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="input max-w-xs"
            ref={searchRef}
          />
        </div>
      </div>

      {showFilters && (
        <div className="card p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Tags</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-2 py-1 rounded text-xs ${
                      selectedTags.includes(tag)
                        ? 'bg-accent-500 text-white'
                        : 'bg-background-soft text-foreground-muted hover:bg-background-soft/80'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="input"
              >
                <option value="">All Categories</option>
                {availableCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Language</label>
              <select
                value={selectedLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="input"
              >
                <option value="">All Languages</option>
                {availableLanguages.map(language => (
                  <option key={language} value={language}>
                    {syntaxHighlightingService.getLanguageDisplayName(language)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <span className="text-sm text-foreground-muted">Sort by:</span>
            {['createdAt', 'title', 'viewCount', 'language'].map(sortBy => (
              <button
                key={sortBy}
                onClick={() => handleSortChange(sortBy)}
                className={`px-3 py-1 rounded text-sm ${
                  sortOptions.sortBy === sortBy
                    ? 'bg-accent-500 text-white'
                    : 'bg-background-soft text-foreground-muted hover:bg-background-soft/80'
                }`}
              >
                {sortBy} {sortOptions.sortBy === sortBy && (sortOptions.sortOrder === 'asc' ? '↑' : '↓')}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="card p-2">
        {filterPastes.length > 0 ? (
          <List
            height={480}
            itemCount={filterPastes.length}
            itemSize={180}
            width="100%"
          >
            {({ index, style }) => {
              const paste = filterPastes[index];
              const stats = expiryService.getPasteStats(paste);
              const isFavoritedPaste = isFavorited(paste._id);
              
              return (
                <div style={style} key={paste._id} className="p-3">
                  <div className="h-[172px] w-full rounded-lg border border-white/10 bg-background-soft shadow-inner p-4 flex flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold truncate">{paste.title}</h3>
                          {paste.isEncrypted && (
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                              🔒 Encrypted
                            </span>
                          )}
                          {stats.isExpired && (
                            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                              ⏰ Expired
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-foreground-muted">
                          <span>{formatDate(paste.createdAt)}</span>
                          <span>•</span>
                          <span>{syntaxHighlightingService.getLanguageDisplayName(paste.language)}</span>
                          <span>•</span>
                          <span>{paste.viewCount || 0} views</span>
                          {stats.timeRemaining && !stats.isExpired && (
                            <>
                              <span>•</span>
                              <span>Expires in {stats.timeRemainingFormatted}</span>
                            </>
                          )}
                        </div>
                        {paste.tags && paste.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {paste.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="text-xs bg-accent-500/20 text-accent-400 px-1.5 py-0.5 rounded">
                                #{tag}
                              </span>
                            ))}
                            {paste.tags.length > 3 && (
                              <span className="text-xs text-foreground-muted">
                                +{paste.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="shrink-0 flex items-center gap-1">
                        <button
                          className="btn-secondary text-xs"
                          onClick={() => handleFavoriteToggle(paste._id)}
                          title={isFavoritedPaste ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          {isFavoritedPaste ? '⭐' : '☆'}
                        </button>
                        <button
                          className="btn-secondary text-xs"
                          onClick={() => {
                            navigator.clipboard.writeText(paste.content);
                            toast.success("Copied to clipboard");
                          }}
                        >
                          Copy
                        </button>
                        <button 
                          className="btn-secondary text-xs" 
                          onClick={() => handleViewPaste(paste._id)}
                        >
                          View
                        </button>
                        <button 
                          className="btn-secondary text-xs" 
                          onClick={() => navigate(`/?pasteId=${paste._id}`)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-secondary text-xs text-danger hover:text-white hover:bg-danger/20"
                          onClick={() => dispatch(removeFromPaste(paste._id))}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-foreground-muted line-clamp-3">{paste.content}</p>
                    <div className="mt-auto pt-3 flex items-center gap-2">
                      <button 
                        className="btn-primary text-xs" 
                        onClick={() => handleShare(paste._id)}
                      >
                        Share
                      </button>
                      {sharedLinks[paste._id] && (
                        <p className="text-xs truncate">
                          <span className="text-foreground-muted">Sharable Link:</span>{" "}
                          <NavLink
                            to={sharedLinks[paste._id]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline decoration-dotted hover:text-accent-500"
                          >
                            {sharedLinks[paste._id]}
                          </NavLink>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            }}
          </List>
        ) : (
          <div className="p-12 text-center grid gap-3">
            <div className="text-foreground-muted">No pastes found</div>
            <div className="text-sm text-foreground-muted">
              Press <kbd className='px-1.5 py-0.5 rounded border border-white/10 bg-background-soft'>/</kbd> to search or create your first paste.
            </div>
            <button className="btn-primary mx-auto" onClick={() => navigate('/')}>
              Create Paste
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default Paste;