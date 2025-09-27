import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  setCollaborationStatus, 
  updateCollaborationCursors, 
  updateCollaborationComments 
} from "../features/paste/pasteSlice";
import collaborationService from "../services/collaborationService";
import toast from "react-hot-toast";

function CollaborationPanel({ pasteId, onContentChange }) {
  const dispatch = useDispatch();
  const collaboration = useSelector((state) => state.paste?.collaboration || {});
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [users, setUsers] = useState([]);
  const [cursors, setCursors] = useState({});
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [userName, setUserName] = useState("Anonymous");
  const [showJoinForm, setShowJoinForm] = useState(true);
  
  const commentInputRef = useRef(null);

  useEffect(() => {
    // Set up collaboration service listeners
    collaborationService.on('connection', (data) => {
      setIsConnected(data.status === 'connected');
      dispatch(setCollaborationStatus({ isConnected: data.status === 'connected' }));
    });

    collaborationService.on('userJoined', (data) => {
      setUsers(prev => [...prev.filter(u => u.userId !== data.userId), data]);
      toast.success(`${data.userName} joined the collaboration`);
    });

    collaborationService.on('userLeft', (data) => {
      setUsers(prev => prev.filter(u => u.userId !== data.userId));
      toast.info(`${data.userName} left the collaboration`);
    });

    collaborationService.on('cursorUpdate', (data) => {
      setCursors(prev => ({
        ...prev,
        [data.userId]: data
      }));
    });

    collaborationService.on('contentChange', (data) => {
      if (data.userId !== collaborationService.getUserInfo().userId) {
        onContentChange?.(data);
      }
    });

    collaborationService.on('commentAdded', (data) => {
      setComments(prev => ({
        ...prev,
        [data.id]: data
      }));
      toast.success(`New comment from ${data.userName}`);
    });

    collaborationService.on('commentUpdated', (data) => {
      setComments(prev => ({
        ...prev,
        [data.id]: data
      }));
    });

    collaborationService.on('commentDeleted', (data) => {
      setComments(prev => {
        const newComments = { ...prev };
        delete newComments[data.id];
        return newComments;
      });
    });

    return () => {
      collaborationService.disconnect();
    };
  }, [dispatch, onContentChange]);

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!userName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    collaborationService.connect('http://localhost:3001', userName.trim());
    setShowJoinForm(false);
  };

  const handleLeaveRoom = () => {
    collaborationService.leaveRoom();
    setRoomId(null);
    setUsers([]);
    setCursors({});
    setComments({});
    setShowJoinForm(true);
    toast.info("Left collaboration room");
  };

  const handleStartCollaboration = () => {
    if (!isConnected) {
      toast.error("Not connected to collaboration server");
      return;
    }

    collaborationService.joinRoom(pasteId);
    setRoomId(pasteId);
    dispatch(setCollaborationStatus({ roomId: pasteId }));
    toast.success("Started collaboration session");
  };

  const handleSendComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    const commentId = collaborationService.addComment({
      content: newComment.trim(),
      pasteId,
      lineNumber: null, // Could be enhanced to support line-specific comments
      position: { x: 0, y: 0 }
    });

    if (commentId) {
      setNewComment("");
      toast.success("Comment sent");
    }
  };

  const handleUpdateCursor = (cursorData) => {
    collaborationService.updateCursor(cursorData);
  };

  const handleContentChange = (changeData) => {
    collaborationService.sendContentChange(changeData);
  };

  const handlePresenceUpdate = (status) => {
    collaborationService.updatePresence(status);
  };

  if (showJoinForm) {
    return (
      <div className="card p-4">
        <h3 className="text-lg font-semibold mb-4">Join Collaboration</h3>
        <form onSubmit={handleJoinRoom}>
          <div className="mb-4">
            <label className="label">Your Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="input"
              required
            />
          </div>
          <button type="submit" className="btn-primary">
            Connect to Collaboration
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Collaboration</h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-foreground-muted">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {!roomId && (
        <div className="mb-4">
          <button
            onClick={handleStartCollaboration}
            disabled={!isConnected}
            className="btn-primary"
          >
            Start Collaboration Session
          </button>
        </div>
      )}

      {roomId && (
        <div className="space-y-4">
          {/* Active Users */}
          <div>
            <h4 className="text-sm font-medium mb-2">Active Users ({users.length})</h4>
            <div className="flex flex-wrap gap-2">
              {users.map(user => (
                <div key={user.userId} className="flex items-center gap-1 text-xs bg-background-soft px-2 py-1 rounded">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>{user.userName}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">Comments ({Object.keys(comments).length})</h4>
              <button
                onClick={() => setShowComments(!showComments)}
                className="btn-secondary text-xs"
              >
                {showComments ? 'Hide' : 'Show'} Comments
              </button>
            </div>
            
            {showComments && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {Object.values(comments).map(comment => (
                  <div key={comment.id} className="text-xs bg-background-soft p-2 rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{comment.userName}</span>
                      <span className="text-foreground-muted">
                        {new Date(comment.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-foreground-muted">{comment.content}</p>
                  </div>
                ))}
                
                <form onSubmit={handleSendComment} className="flex gap-2">
                  <input
                    ref={commentInputRef}
                    type="text"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="input text-xs flex-1"
                  />
                  <button type="submit" className="btn-secondary text-xs">
                    Send
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePresenceUpdate('typing')}
              className="btn-secondary text-xs"
            >
              Typing
            </button>
            <button
              onClick={() => handlePresenceUpdate('viewing')}
              className="btn-secondary text-xs"
            >
              Viewing
            </button>
            <button
              onClick={handleLeaveRoom}
              className="btn-secondary text-xs text-red-400 hover:text-red-300"
            >
              Leave Room
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CollaborationPanel;
