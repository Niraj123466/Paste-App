class ExpiryService {
  constructor() {
    this.expiryTypes = {
      NEVER: 'never',
      ONE_HOUR: '1h',
      ONE_DAY: '1d',
      ONE_WEEK: '1w',
      ONE_MONTH: '1M',
      CUSTOM: 'custom'
    };

    this.accessTypes = {
      PUBLIC: 'public',
      PRIVATE: 'private',
      PASSWORD_PROTECTED: 'password',
      VIEW_COUNT_LIMITED: 'view_count',
      DOMAIN_RESTRICTED: 'domain'
    };
  }

  /**
   * Calculate expiry date from type and custom date
   * @param {string} expiryType - Type of expiry
   * @param {Date} customDate - Custom expiry date
   * @returns {Date|null} - Expiry date or null for never
   */
  calculateExpiryDate(expiryType, customDate = null) {
    const now = new Date();

    switch (expiryType) {
      case this.expiryTypes.NEVER:
        return null;
      
      case this.expiryTypes.ONE_HOUR:
        return new Date(now.getTime() + 60 * 60 * 1000);
      
      case this.expiryTypes.ONE_DAY:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      case this.expiryTypes.ONE_WEEK:
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      case this.expiryTypes.ONE_MONTH:
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      case this.expiryTypes.CUSTOM:
        return customDate ? new Date(customDate) : null;
      
      default:
        return null;
    }
  }

  /**
   * Check if a paste has expired
   * @param {object} paste - Paste object
   * @returns {boolean} - True if expired
   */
  isExpired(paste) {
    if (!paste.expiryDate) {
      return false;
    }

    const now = new Date();
    const expiryDate = new Date(paste.expiryDate);
    
    return now > expiryDate;
  }

  /**
   * Get time remaining until expiry
   * @param {object} paste - Paste object
   * @returns {object} - Time remaining object
   */
  getTimeRemaining(paste) {
    if (!paste.expiryDate) {
      return { expired: false, remaining: null };
    }

    const now = new Date();
    const expiryDate = new Date(paste.expiryDate);
    const diff = expiryDate.getTime() - now.getTime();

    if (diff <= 0) {
      return { expired: true, remaining: null };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return {
      expired: false,
      remaining: {
        days,
        hours,
        minutes,
        seconds,
        total: diff
      }
    };
  }

  /**
   * Format time remaining as string
   * @param {object} timeRemaining - Time remaining object
   * @returns {string} - Formatted time string
   */
  formatTimeRemaining(timeRemaining) {
    if (!timeRemaining) {
      return 'Expired';
    }
    if (timeRemaining.expired) {
      return 'Expired';
    }
    if (!timeRemaining.remaining) {
      return 'No expiry';
    }

    const { days, hours, minutes, seconds } = timeRemaining.remaining;
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Check if paste has reached view limit
   * @param {object} paste - Paste object
   * @returns {boolean} - True if view limit reached
   */
  isViewLimitReached(paste) {
    if (!paste.viewLimit || !paste.viewCount) {
      return false;
    }

    return paste.viewCount >= paste.viewLimit;
  }

  /**
   * Increment view count
   * @param {object} paste - Paste object
   * @returns {object} - Updated paste object
   */
  incrementViewCount(paste) {
    const updatedPaste = { ...paste };
    updatedPaste.viewCount = (updatedPaste.viewCount || 0) + 1;
    updatedPaste.lastViewedAt = new Date().toISOString();
    return updatedPaste;
  }

  /**
   * Check if paste is accessible based on access controls
   * @param {object} paste - Paste object
   * @param {string} password - Password for password-protected pastes
   * @param {string} domain - Current domain for domain-restricted pastes
   * @returns {object} - Access result
   */
  checkAccess(paste, password = null, domain = null) {
    // Check if expired
    if (this.isExpired(paste)) {
      return {
        accessible: false,
        reason: 'expired',
        message: 'This paste has expired'
      };
    }

    // Check view limit
    if (this.isViewLimitReached(paste)) {
      return {
        accessible: false,
        reason: 'view_limit_reached',
        message: 'This paste has reached its view limit'
      };
    }

    // Check access type
    switch (paste.accessType) {
      case this.accessTypes.PUBLIC:
        return {
          accessible: true,
          reason: 'public',
          message: 'Public paste'
        };

      case this.accessTypes.PRIVATE:
        return {
          accessible: false,
          reason: 'private',
          message: 'This paste is private'
        };

      case this.accessTypes.PASSWORD_PROTECTED:
        if (!password) {
          return {
            accessible: false,
            reason: 'password_required',
            message: 'Password required'
          };
        }
        
        // In a real app, you'd verify the password hash
        if (password === paste.password) {
          return {
            accessible: true,
            reason: 'password_correct',
            message: 'Access granted'
          };
        } else {
          return {
            accessible: false,
            reason: 'password_incorrect',
            message: 'Incorrect password'
          };
        }

      case this.accessTypes.DOMAIN_RESTRICTED:
        if (!domain || !paste.allowedDomains) {
          return {
            accessible: false,
            reason: 'domain_restricted',
            message: 'Domain access restricted'
          };
        }
        
        const isAllowed = paste.allowedDomains.some(allowedDomain => 
          domain.includes(allowedDomain)
        );
        
        if (isAllowed) {
          return {
            accessible: true,
            reason: 'domain_allowed',
            message: 'Domain access granted'
          };
        } else {
          return {
            accessible: false,
            reason: 'domain_not_allowed',
            message: 'Access denied from this domain'
          };
        }

      default:
        return {
          accessible: true,
          reason: 'default',
          message: 'Access granted'
        };
    }
  }

  /**
   * Create access control object
   * @param {string} accessType - Type of access control
   * @param {object} options - Additional options
   * @returns {object} - Access control object
   */
  createAccessControl(accessType, options = {}) {
    const accessControl = {
      accessType,
      createdAt: new Date().toISOString()
    };

    switch (accessType) {
      case this.accessTypes.PASSWORD_PROTECTED:
        accessControl.password = options.password;
        break;
      
      case this.accessTypes.VIEW_COUNT_LIMITED:
        accessControl.viewLimit = options.viewLimit || 10;
        accessControl.viewCount = 0;
        break;
      
      case this.accessTypes.DOMAIN_RESTRICTED:
        accessControl.allowedDomains = options.allowedDomains || [];
        break;
    }

    return accessControl;
  }

  /**
   * Get expiry options for UI
   * @returns {Array} - Array of expiry options
   */
  getExpiryOptions() {
    return [
      { value: this.expiryTypes.NEVER, label: 'Never expire' },
      { value: this.expiryTypes.ONE_HOUR, label: '1 hour' },
      { value: this.expiryTypes.ONE_DAY, label: '1 day' },
      { value: this.expiryTypes.ONE_WEEK, label: '1 week' },
      { value: this.expiryTypes.ONE_MONTH, label: '1 month' },
      { value: this.expiryTypes.CUSTOM, label: 'Custom date' }
    ];
  }

  /**
   * Get access type options for UI
   * @returns {Array} - Array of access type options
   */
  getAccessTypeOptions() {
    return [
      { value: this.accessTypes.PUBLIC, label: 'Public' },
      { value: this.accessTypes.PRIVATE, label: 'Private' },
      { value: this.accessTypes.PASSWORD_PROTECTED, label: 'Password protected' },
      { value: this.accessTypes.VIEW_COUNT_LIMITED, label: 'View count limited' },
      { value: this.accessTypes.DOMAIN_RESTRICTED, label: 'Domain restricted' }
    ];
  }

  /**
   * Clean up expired pastes
   * @param {Array} pastes - Array of pastes
   * @returns {Array} - Array of non-expired pastes
   */
  cleanupExpiredPastes(pastes) {
    return pastes.filter(paste => !this.isExpired(paste));
  }

  /**
   * Get paste statistics
   * @param {object} paste - Paste object
   * @returns {object} - Statistics object
   */
  getPasteStats(paste) {
    const timeRemaining = this.getTimeRemaining(paste);
    const isExpired = this.isExpired(paste);
    const isViewLimitReached = this.isViewLimitReached(paste);

    return {
      isExpired,
      isViewLimitReached,
      timeRemaining: timeRemaining.remaining,
      timeRemainingFormatted: this.formatTimeRemaining(timeRemaining),
      viewCount: paste.viewCount || 0,
      viewLimit: paste.viewLimit || null,
      viewsRemaining: paste.viewLimit ? Math.max(0, paste.viewLimit - (paste.viewCount || 0)) : null,
      accessType: paste.accessType || this.accessTypes.PUBLIC,
      expiryDate: paste.expiryDate || null
    };
  }
}

export default new ExpiryService();
