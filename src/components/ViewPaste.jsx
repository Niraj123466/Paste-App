import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow, vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  incrementViewCount, 
  toggleFavorite,
  addTag,
  removeTag,
  setCategory
} from "../features/paste/pasteSlice";
import toast from "react-hot-toast";
import syntaxHighlightingService from "../services/syntaxHighlightingService.jsx";
import expiryService from "../services/expiryService";
import encryptionService from "../services/encryptionService";
import searchOrganizationService from "../services/searchOrganizationService";

function ViewPaste() {
  const { pasteId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const pastes = useSelector((state) => state.paste?.pastes || []);
  
  const [paste, setPaste] = useState(null);
  const [password, setPassword] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isDecrypted, setIsDecrypted] = useState(false);
  const [decryptedContent, setDecryptedContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [theme, setTheme] = useState("dark");
  
  const passwordRef = useRef(null);

  useEffect(() => {
    const foundPaste = pastes.find(p => p._id === pasteId);
    if (foundPaste) {
      setPaste(foundPaste);
      setNewCategory(foundPaste.category || "General");
      
      // Check if paste is accessible
      const accessResult = expiryService.checkAccess(foundPaste, password);
      
      if (!accessResult.accessible) {
        if (accessResult.reason === 'password_required') {
          setShowPasswordForm(true);
        } else {
          toast.error(accessResult.message);
          navigate('/pastes');
          return;
        }
      } else {
        // Increment view count
        dispatch(incrementViewCount(pasteId));
        
        // Handle encrypted content
        if (foundPaste.isEncrypted && foundPaste.content) {
          try {
            const encryptedData = JSON.parse(foundPaste.content);
            const decrypted = encryptionService.decrypt(encryptedData, password || "default");
            setDecryptedContent(decrypted);
            setIsDecrypted(true);
          } catch (error) {
            toast.error("Failed to decrypt content");
          }
        }
      }
    } else {
      toast.error("Paste not found");
      navigate('/pastes');
    }
  }, [pasteId, pastes, password, dispatch, navigate]);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!password.trim()) {
      toast.error("Password is required");
      return;
    }
    
    const accessResult = expiryService.checkAccess(paste, password);
    if (accessResult.accessible) {
      setShowPasswordForm(false);
      dispatch(incrementViewCount(pasteId));
      
      // Handle encrypted content
      if (paste.isEncrypted && paste.content) {
        try {
          const encryptedData = JSON.parse(paste.content);
          const decrypted = encryptionService.decrypt(encryptedData, password);
          setDecryptedContent(decrypted);
          setIsDecrypted(true);
        } catch (error) {
          toast.error("Failed to decrypt content");
        }
      }
    } else {
      toast.error(accessResult.message);
    }
  };

  const handleCopyContent = () => {
    const contentToCopy = isDecrypted ? decryptedContent : paste.content;
    navigator.clipboard.writeText(contentToCopy);
    toast.success("Content copied to clipboard");
  };

  const handleCopyLine = (lineNumber) => {
    const lines = (isDecrypted ? decryptedContent : paste.content).split('\n');
    const lineContent = lines[lineNumber - 1] || '';
    navigator.clipboard.writeText(lineContent);
    toast.success(`Line ${lineNumber} copied to clipboard`);
  };

  const handleFavoriteToggle = () => {
    dispatch(toggleFavorite(pasteId));
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (newTag.trim()) {
      dispatch(addTag({ pasteId, tag: newTag.trim() }));
      setNewTag("");
      toast.success("Tag added");
    }
  };

  const handleRemoveTag = (tag) => {
    dispatch(removeTag({ pasteId, tag }));
    toast.success("Tag removed");
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    dispatch(setCategory({ pasteId, category }));
    setNewCategory(category);
    toast.success("Category updated");
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleString();

  const isFavorited = (pasteId) => {
    try {
      return searchOrganizationService.isFavorited(pasteId);
    } catch (error) {
      // Fallback to localStorage if service fails
      const favorites = JSON.parse(localStorage.getItem('pasteApp_favorites') || '[]');
      return favorites.includes(pasteId);
    }
  };

  if (!paste) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-foreground-muted">Loading paste...</div>
        </div>
      </div>
    );
  }

  if (showPasswordForm) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="card p-6 max-w-md w-full">
          <h2 className="text-xl font-semibold mb-4">Password Required</h2>
          <p className="text-foreground-muted mb-4">
            This paste is password protected. Please enter the password to view it.
          </p>
          <form onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input w-full mb-4"
              ref={passwordRef}
              autoFocus
            />
            <div className="flex gap-2">
              <button type="submit" className="btn-primary flex-1">
                View Paste
              </button>
              <button 
                type="button" 
                onClick={() => navigate('/pastes')}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const stats = expiryService.getPasteStats(paste);
  const isFavoritedPaste = isFavorited(pasteId);
  const contentToDisplay = isDecrypted ? decryptedContent : paste.content;

  return (
    <section className="grid gap-6">
      <header className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-semibold">{paste.title}</h1>
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
            {stats.isViewLimitReached && (
              <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded">
                👁️ View Limit Reached
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-foreground-muted">
            <span>Created: {formatDate(paste.createdAt)}</span>
            {paste.updatedAt && paste.updatedAt !== paste.createdAt && (
              <span>Updated: {formatDate(paste.updatedAt)}</span>
            )}
            <span>Language: {syntaxHighlightingService.getLanguageDisplayName(paste.language)}</span>
            <span>Views: {paste.viewCount || 0}</span>
            {stats.timeRemaining && !stats.isExpired && (
              <span>Expires in: {stats.timeRemainingFormatted}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="btn-secondary text-xs"
            title="Toggle theme"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <button
            onClick={handleFavoriteToggle}
            className="btn-secondary text-xs"
            title={isFavoritedPaste ? "Remove from favorites" : "Add to favorites"}
          >
            {isFavoritedPaste ? "⭐" : "☆"}
          </button>
          <button
            onClick={handleCopyContent}
            className="btn-secondary text-xs"
          >
            Copy All
          </button>
          <button
            onClick={() => navigate(`/?pasteId=${pasteId}`)}
            className="btn-secondary text-xs"
          >
            Edit
          </button>
        </div>
      </header>

      {/* Tags and Category */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Tags</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {paste.tags?.map(tag => (
                <span key={tag} className="text-xs bg-accent-500/20 text-accent-400 px-2 py-1 rounded">
                  #{tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-red-400"
                  >
                    ×
                  </button>
                </span>
              ))}
              <form onSubmit={handleAddTag} className="flex gap-1">
                <input
                  type="text"
                  placeholder="Add tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="input text-xs w-20"
                />
                <button type="submit" className="btn-secondary text-xs">
                  Add
                </button>
              </form>
            </div>
          </div>
          <div>
            <label className="label">Category</label>
            <select
              value={newCategory}
              onChange={handleCategoryChange}
              className="input"
            >
              <option value="General">General</option>
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
              <option value="Code">Code</option>
              <option value="Documentation">Documentation</option>
              <option value="Tutorial">Tutorial</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="card p-0 overflow-hidden">
        <div className="bg-background-soft px-4 py-2 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {syntaxHighlightingService.getLanguageDisplayName(paste.language)}
            </span>
            <span className="text-xs text-foreground-muted">
              {contentToDisplay.split('\n').length} lines
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyContent}
              className="btn-secondary text-xs"
            >
              Copy All
            </button>
          </div>
        </div>
        
        <div className="relative">
          <SyntaxHighlighter
            language={paste.language}
            style={theme === "dark" ? vscDarkPlus : tomorrow}
            customStyle={{
              margin: 0,
              padding: "16px",
              fontSize: "14px",
              lineHeight: "1.5",
              background: "transparent"
            }}
            showLineNumbers={true}
            wrapLines={true}
            wrapLongLines={true}
            lineNumberStyle={{
              minWidth: "3em",
              paddingRight: "1em",
              color: "#666",
              userSelect: "none"
            }}
            lineProps={(lineNumber) => ({
              onClick: () => handleCopyLine(lineNumber),
              style: {
                cursor: "pointer",
                padding: "0 8px",
                margin: "0 -8px"
              },
              title: "Click to copy line"
            })}
          >
            {contentToDisplay}
          </SyntaxHighlighter>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-foreground-muted">
          {paste.accessType === "public" ? "Public paste" : `${paste.accessType} paste`}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigator.clipboard.writeText(`${window.location.origin}/pastes/${pasteId}`)}
            className="btn-secondary text-xs"
          >
            Copy Link
          </button>
          <button
            onClick={() => navigate(`/collaborate/${pasteId}`)}
            className="btn-secondary text-xs"
          >
            Collaborate
          </button>
          <button
            onClick={() => navigate('/pastes')}
            className="btn-secondary text-xs"
          >
            Back to Pastes
          </button>
        </div>
      </div>
    </section>
  );
}

export default ViewPaste;