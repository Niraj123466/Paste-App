import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

class CollaborationService {
  constructor() {
    this.socket = null;
    this.roomId = null;
    this.userId = uuidv4();
    this.userName = 'Anonymous';
    this.isConnected = false;
    this.cursors = {};
    this.comments = {};
    this.listeners = new Map();
  }

  /**
   * Connect to collaboration server
   * @param {string} serverUrl - Socket server URL
   * @param {string} userName - User display name
   */
  connect(serverUrl = 'http://localhost:3001', userName = 'Anonymous') {
    this.userName = userName;
    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      this.emit('connection', { status: 'connected', userId: this.userId });
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      this.emit('connection', { status: 'disconnected', userId: this.userId });
    });

    this.socket.on('userJoined', (data) => {
      this.emit('userJoined', data);
    });

    this.socket.on('userLeft', (data) => {
      delete this.cursors[data.userId];
      this.emit('userLeft', data);
    });

    this.socket.on('cursorUpdate', (data) => {
      this.cursors[data.userId] = data;
      this.emit('cursorUpdate', data);
    });

    this.socket.on('contentChange', (data) => {
      this.emit('contentChange', data);
    });

    this.socket.on('commentAdded', (data) => {
      this.comments[data.id] = data;
      this.emit('commentAdded', data);
    });

    this.socket.on('commentUpdated', (data) => {
      this.comments[data.id] = data;
      this.emit('commentUpdated', data);
    });

    this.socket.on('commentDeleted', (data) => {
      delete this.comments[data.id];
      this.emit('commentDeleted', data);
    });

    this.socket.on('presenceUpdate', (data) => {
      this.emit('presenceUpdate', data);
    });
  }

  /**
   * Join a collaboration room
   * @param {string} pasteId - Paste ID to collaborate on
   */
  joinRoom(pasteId) {
    if (!this.socket || !this.isConnected) {
      console.warn('Socket not connected');
      return;
    }

    this.roomId = pasteId;
    this.socket.emit('joinRoom', {
      roomId: pasteId,
      userId: this.userId,
      userName: this.userName
    });
  }

  /**
   * Leave current collaboration room
   */
  leaveRoom() {
    if (this.socket && this.roomId) {
      this.socket.emit('leaveRoom', {
        roomId: this.roomId,
        userId: this.userId
      });
      this.roomId = null;
      this.cursors = {};
      this.comments = {};
    }
  }

  /**
   * Send cursor position update
   * @param {object} cursorData - Cursor position and selection
   */
  updateCursor(cursorData) {
    if (this.socket && this.roomId) {
      this.socket.emit('cursorUpdate', {
        roomId: this.roomId,
        userId: this.userId,
        userName: this.userName,
        ...cursorData
      });
    }
  }

  /**
   * Send content change
   * @param {object} changeData - Content change data
   */
  sendContentChange(changeData) {
    if (this.socket && this.roomId) {
      this.socket.emit('contentChange', {
        roomId: this.roomId,
        userId: this.userId,
        userName: this.userName,
        ...changeData
      });
    }
  }

  /**
   * Add a comment
   * @param {object} commentData - Comment data
   */
  addComment(commentData) {
    if (this.socket && this.roomId) {
      const comment = {
        id: uuidv4(),
        roomId: this.roomId,
        userId: this.userId,
        userName: this.userName,
        timestamp: new Date().toISOString(),
        ...commentData
      };

      this.socket.emit('addComment', comment);
      return comment.id;
    }
  }

  /**
   * Update a comment
   * @param {string} commentId - Comment ID
   * @param {object} updateData - Updated comment data
   */
  updateComment(commentId, updateData) {
    if (this.socket && this.roomId) {
      this.socket.emit('updateComment', {
        id: commentId,
        roomId: this.roomId,
        userId: this.userId,
        ...updateData
      });
    }
  }

  /**
   * Delete a comment
   * @param {string} commentId - Comment ID
   */
  deleteComment(commentId) {
    if (this.socket && this.roomId) {
      this.socket.emit('deleteComment', {
        id: commentId,
        roomId: this.roomId,
        userId: this.userId
      });
    }
  }

  /**
   * Send presence update (typing, viewing, etc.)
   * @param {string} status - Presence status
   */
  updatePresence(status) {
    if (this.socket && this.roomId) {
      this.socket.emit('presenceUpdate', {
        roomId: this.roomId,
        userId: this.userId,
        userName: this.userName,
        status,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get all cursors in current room
   * @returns {object} - Object of user cursors
   */
  getCursors() {
    return this.cursors;
  }

  /**
   * Get all comments in current room
   * @returns {object} - Object of comments
   */
  getComments() {
    return this.comments;
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {function} callback - Callback function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {function} callback - Callback function
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to listeners
   * @param {string} event - Event name
   * @param {any} data - Event data
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  /**
   * Disconnect from server
   */
  disconnect() {
    if (this.socket) {
      this.leaveRoom();
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
  }

  /**
   * Get connection status
   * @returns {boolean} - Connection status
   */
  getConnectionStatus() {
    return this.isConnected;
  }

  /**
   * Get current user info
   * @returns {object} - User information
   */
  getUserInfo() {
    return {
      userId: this.userId,
      userName: this.userName,
      isConnected: this.isConnected,
      roomId: this.roomId
    };
  }
}

export default new CollaborationService();
