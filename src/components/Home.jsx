import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { nanoid } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { 
  addToPaste, 
  updateToPaste, 
  setEncryption, 
  setSelectedLanguage,
  setAccessControls,
  initializeServices
} from "../features/paste/pasteSlice";
import toast from "react-hot-toast";
import syntaxHighlightingService from "../services/syntaxHighlightingService.jsx";
import encryptionService from "../services/encryptionService";
import expiryService from "../services/expiryService";

function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("General");
  const [language, setLanguage] = useState("text");
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [encryptionPassword, setEncryptionPassword] = useState("");
  const [expiryType, setExpiryType] = useState("never");
  const [customExpiryDate, setCustomExpiryDate] = useState("");
  const [accessType, setAccessType] = useState("public");
  const [viewLimit, setViewLimit] = useState(10);
  const [password, setPassword] = useState("");
  const [allowedDomains, setAllowedDomains] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const pasteId = searchParams.get("pasteId");
  const dispatch = useDispatch();
  const titleRef = useRef(null);
  const contentRef = useRef(null);
  
  const selectedLanguage = useSelector((state) => state.paste?.selectedLanguage || "text");
  const availableLanguages = syntaxHighlightingService.getAvailableLanguages();

  // Load existing paste for editing
  useEffect(() => {
    if (pasteId) {
      const existingPastes = JSON.parse(localStorage.getItem("pastes") || "[]");
      const existingPaste = existingPastes.find(p => p._id === pasteId);
      if (existingPaste) {
        setTitle(existingPaste.title);
        setValue(existingPaste.content);
        setTags(existingPaste.tags?.join(", ") || "");
        setCategory(existingPaste.category || "General");
        setLanguage(existingPaste.language || "text");
        setIsEncrypted(existingPaste.isEncrypted || false);
        setExpiryType(existingPaste.expiryType || "never");
        setAccessType(existingPaste.accessType || "public");
        setViewLimit(existingPaste.viewLimit || 10);
        setAllowedDomains(existingPaste.allowedDomains?.join(", ") || "");
      }
    }
  }, [pasteId]);

  // Auto-detect language when content changes
  useEffect(() => {
    if (value && language === "text") {
      const detectedLanguage = syntaxHighlightingService.detectLanguage(value, title);
      setLanguage(detectedLanguage);
      dispatch(setSelectedLanguage(detectedLanguage));
    }
  }, [value, title, language, dispatch]);

  function createPaste() {
    if (!title.trim() || !value.trim()) {
      toast.error("Title and content are required");
      return;
    }

    // Parse tags
    const parsedTags = tags.split(",").map(tag => tag.trim()).filter(tag => tag);

    // Parse allowed domains
    const parsedDomains = allowedDomains.split(",").map(domain => domain.trim()).filter(domain => domain);

    // Create the paste object
    const paste = {
      _id: pasteId || nanoid(),
      title: title.trim(),
      content: value.trim(),
      tags: parsedTags,
      category: category.trim(),
      language: language,
      createdAt: pasteId ? undefined : new Date().toISOString(),
      isEncrypted,
      accessType,
      expiryType,
      viewLimit: accessType === "view_count" ? parseInt(viewLimit) : undefined,
      password: accessType === "password" ? password : undefined,
      allowedDomains: accessType === "domain" ? parsedDomains : undefined
    };

    // Handle encryption
    if (isEncrypted && encryptionPassword) {
      try {
        const encryptedData = encryptionService.encrypt(paste.content, encryptionPassword);
        paste.content = JSON.stringify(encryptedData);
        paste.isEncrypted = true;
      } catch (error) {
        toast.error("Encryption failed: " + error.message);
        return;
      }
    }

    // Handle expiry
    if (expiryType !== "never") {
      paste.expiryDate = expiryService.calculateExpiryDate(expiryType, customExpiryDate);
    }

    // Update Redux state
    dispatch(setEncryption({ isEncrypted, password: encryptionPassword }));
    dispatch(setAccessControls({
      expiryType,
      customExpiryDate,
      accessType,
      password,
      viewLimit,
      allowedDomains: parsedDomains
    }));

    if (pasteId) {
      dispatch(updateToPaste(paste));
    } else {
      dispatch(addToPaste(paste));
    }

    // Cleanup
    setTitle("");
    setValue("");
    setTags("");
    setCategory("General");
    setLanguage("text");
    setIsEncrypted(false);
    setEncryptionPassword("");
    setExpiryType("never");
    setCustomExpiryDate("");
    setAccessType("public");
    setViewLimit(10);
    setPassword("");
    setAllowedDomains("");
    setSearchParams({});
    
    toast.success(pasteId ? "Paste updated successfully" : "Paste created successfully");
  }

  useEffect(() => {
    function onKeyDown(e) {
      const isSubmit = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'enter';
      if (isSubmit) {
        e.preventDefault();
        createPaste();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [title, value, searchParams]);

  // Initialize services
  useEffect(() => {
    dispatch(initializeServices());
  }, [dispatch]);

  return (
    <section className="grid gap-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{pasteId ? "Edit Paste" : "Create Paste"}</h1>
          <p className="text-foreground-muted text-sm">
            Write and save your snippets securely. Tip: Press Cmd/Ctrl+Enter to {pasteId ? 'save' : 'create'}.
          </p>
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="btn-secondary"
        >
          {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
        </button>
      </header>

      <div className="grid gap-4">
        {/* Basic Information */}
        <div className="card p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Title *</label>
              <input
                type="text"
                placeholder="Enter a descriptive title"
                minLength="3"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input"
                ref={titleRef}
              />
            </div>
            <div>
              <label className="label">Category</label>
              <input
                type="text"
                placeholder="e.g., Work, Personal, Code"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="label">Language</label>
              <select
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value);
                  dispatch(setSelectedLanguage(e.target.value));
                }}
                className="input"
              >
                {availableLanguages.map(lang => (
                  <option key={lang} value={lang}>
                    {syntaxHighlightingService.getLanguageDisplayName(lang)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Tags (comma-separated)</label>
              <input
                type="text"
                placeholder="javascript, react, tutorial"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="card p-4">
            <h3 className="text-lg font-semibold mb-4">Advanced Options</h3>
            
            {/* Encryption */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="label">Encryption</label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isEncrypted}
                    onChange={(e) => setIsEncrypted(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Enable end-to-end encryption</span>
                </div>
              </div>
              {isEncrypted && (
                <div>
                  <label className="label">Encryption Password</label>
                  <input
                    type="password"
                    placeholder="Enter encryption password"
                    value={encryptionPassword}
                    onChange={(e) => setEncryptionPassword(e.target.value)}
                    className="input"
                  />
                </div>
              )}
            </div>

            {/* Expiry */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="label">Expiry</label>
                <select
                  value={expiryType}
                  onChange={(e) => setExpiryType(e.target.value)}
                  className="input"
                >
                  {expiryService.getExpiryOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              {expiryType === "custom" && (
                <div>
                  <label className="label">Custom Expiry Date</label>
                  <input
                    type="datetime-local"
                    value={customExpiryDate}
                    onChange={(e) => setCustomExpiryDate(e.target.value)}
                    className="input"
                  />
                </div>
              )}
            </div>

            {/* Access Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="label">Access Type</label>
                <select
                  value={accessType}
                  onChange={(e) => setAccessType(e.target.value)}
                  className="input"
                >
                  {expiryService.getAccessTypeOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              {accessType === "view_count" && (
                <div>
                  <label className="label">View Limit</label>
                  <input
                    type="number"
                    min="1"
                    value={viewLimit}
                    onChange={(e) => setViewLimit(parseInt(e.target.value))}
                    className="input"
                  />
                </div>
              )}
            </div>

            {/* Password Protection */}
            {accessType === "password" && (
              <div className="mb-4">
                <label className="label">Access Password</label>
                <input
                  type="password"
                  placeholder="Enter access password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                />
              </div>
            )}

            {/* Domain Restrictions */}
            {accessType === "domain" && (
              <div className="mb-4">
                <label className="label">Allowed Domains (comma-separated)</label>
                <input
                  type="text"
                  placeholder="example.com, subdomain.example.com"
                  value={allowedDomains}
                  onChange={(e) => setAllowedDomains(e.target.value)}
                  className="input"
                />
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="card p-4">
          <label htmlFor="pastecontent" className="label">Content *</label>
          <textarea
            name="pastecontent"
            id="pastecontent"
            placeholder="Enter the paste content..."
            minLength="3"
            rows="18"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="input min-h-[280px] font-mono"
            ref={contentRef}
          />
          <div className="flex items-center justify-between mt-2">
            <div className="text-sm text-foreground-muted">
              {value.length} characters
              {isEncrypted && (
                <span className="ml-2 text-green-400">🔒 Will be encrypted</span>
              )}
            </div>
            <div className="text-sm text-foreground-muted">
              Language: {syntaxHighlightingService.getLanguageDisplayName(language)}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-foreground-muted">
            {pasteId ? "Editing existing paste" : "Creating new paste"}
          </div>
          <button onClick={createPaste} className="btn-primary">
            {pasteId ? "Save Changes" : "Create Paste"}
          </button>
        </div>
      </div>
    </section>
  );
}

export default Home;