import { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FixedSizeList as List } from "react-window";
import useDebounce from "./useDebounce"; // Custom debounce hook
import { NavLink, useNavigate } from "react-router-dom";
import { removeFromPaste } from "../features/paste/pasteSlice";
import toast from "react-hot-toast";

function Paste() {
  const pastes = useSelector((state) => state.paste?.pastes || []);
  const [searchQuery, setSearchQuery] = useState("");
  const [sharedLinks, setSharedLinks] = useState({}); // State to track generated links
  const navigate = useNavigate();
  const dispatch = useDispatch()

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const filterPastes = useMemo(() => {
    return pastes.filter((paste) =>
      paste.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    );
  }, [pastes, debouncedSearchQuery]);

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  const handleShare = (pasteId) => {
    const sharableLink = `${window.location.origin}/pastes/${pasteId}`;
    setSharedLinks((prev) => ({
      ...prev,
      [pasteId]: sharableLink,
    }));
  };

  return (
    <div>
      <div>
        <input
          type="search"
          placeholder="Search pastes..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>
      <div>
        {filterPastes.length > 0 ? (
          <List
            height={400}
            itemCount={filterPastes.length}
            itemSize={150}
            width="1000px"
          >
            {({ index, style }) => {
              const paste = filterPastes[index];
              return (
                <div style={style} key={paste._id} className="border">
                  <h3>{paste.title}</h3>
                  <p>{paste.content}</p>
                  <p>{formatDate(paste.createdAt)}</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(paste.content);
                      toast.success("Copied to clipboard")
                    }}
                  >
                    Copy
                  </button>

                  <button onClick={() => navigate(`/pastes/${paste._id}`)}>
                    View
                  </button>

                  <button onClick={() => navigate(`/?pasteId=${paste._id}`)}>
                    Edit
                  </button>
                  
                  <button onClick={() => {
                    dispatch(removeFromPaste(paste._id))
                  }}>
                    Delete
                  </button>

                  <button onClick={() => handleShare(paste._id)}>Share</button>
                  {sharedLinks[paste._id] && (
                    <p>
                      Sharable Link:{" "}
                      <NavLink
                        to={sharedLinks[paste._id]}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {sharedLinks[paste._id]}
                      </NavLink>
                    </p>

                  )}
                </div>
              );
            }}
          </List>
        ) : (
          <p>No results found</p>
        )}
      </div>
    </div>
  );
}

export default Paste;
