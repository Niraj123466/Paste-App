import { createSlice } from '@reduxjs/toolkit'
import toast from 'react-hot-toast';
import encryptionService from '../../services/encryptionService';
import syntaxHighlightingService from '../../services/syntaxHighlightingService.jsx';
import expiryService from '../../services/expiryService';
import searchOrganizationService from '../../services/searchOrganizationService';

const initialState = {
  pastes: localStorage.getItem("pastes") ? JSON.parse(localStorage.getItem("pastes")):[] ,
  currentPaste: null,
  isEncrypted: false,
  encryptionPassword: '',
  selectedLanguage: 'text',
  searchQuery: '',
  searchFilters: {
    tags: [],
    category: '',
    language: '',
    dateRange: null,
    favoritesOnly: false,
    recentOnly: false
  },
  sortOptions: {
    sortBy: 'createdAt',
    sortOrder: 'desc'
  },
  collaboration: {
    isConnected: false,
    roomId: null,
    users: [],
    cursors: {},
    comments: {}
  },
  accessControls: {
    expiryType: 'never',
    customExpiryDate: null,
    accessType: 'public',
    password: '',
    viewLimit: null,
    allowedDomains: []
  }
}

export const pasteSlice = createSlice({
  name: 'paste',
  initialState,
  reducers: {
    addToPaste: (state, action) => {
      const paste = action.payload
      const idx = state.pastes.findIndex((item) => item._id === paste._id)
      if(idx >= 0) {
        toast.error("Paste already exists")
        return
      }

      // Auto-detect language if not specified
      if (!paste.language) {
        paste.language = syntaxHighlightingService.detectLanguage(paste.content, paste.title)
      }

      // Add expiry date if specified
      if (state.accessControls.expiryType !== 'never') {
        paste.expiryDate = expiryService.calculateExpiryDate(
          state.accessControls.expiryType,
          state.accessControls.customExpiryDate
        )
      }

      // Add access controls
      paste.accessType = state.accessControls.accessType
      if (state.accessControls.accessType === 'password' && state.accessControls.password) {
        paste.password = state.accessControls.password
      }
      if (state.accessControls.accessType === 'view_count' && state.accessControls.viewLimit) {
        paste.viewLimit = state.accessControls.viewLimit
        paste.viewCount = 0
      }
      if (state.accessControls.accessType === 'domain' && state.accessControls.allowedDomains.length > 0) {
        paste.allowedDomains = state.accessControls.allowedDomains
      }

      // Add default values
      paste.createdAt = paste.createdAt || new Date().toISOString()
      paste.updatedAt = new Date().toISOString()
      paste.tags = paste.tags || []
      paste.category = paste.category || 'General'
      paste.isEncrypted = state.isEncrypted
      paste.viewCount = paste.viewCount || 0

      state.pastes.push(paste)
      searchOrganizationService.indexPaste(paste)
      localStorage.setItem("pastes", JSON.stringify(state.pastes))
      toast.success("Paste created successfully")
    },
    updateToPaste: (state, action) => {
      const paste = action.payload
      const idx = state.pastes.findIndex((item) => item._id === paste._id)
      if(idx < 0) {
        toast.error("Unable to update paste")
        return
      }

      // Auto-detect language if not specified
      if (!paste.language) {
        paste.language = syntaxHighlightingService.detectLanguage(paste.content, paste.title)
      }

      paste.updatedAt = new Date().toISOString()
      state.pastes[idx] = paste
      searchOrganizationService.indexPaste(paste)
      localStorage.setItem("pastes", JSON.stringify(state.pastes))
      toast.success("Paste updated successfully")
    },
    removeFromPaste: (state, action) => {
      const pasteId = action.payload
      if(!pasteId) {
        toast.error("Unable to delete paste")
        return
      }
      
      const idx = state.pastes.findIndex((item) => item._id === pasteId)
      if(idx >= 0) {
        state.pastes.splice(idx, 1)
        searchOrganizationService.removeFromIndex(pasteId)
        localStorage.setItem("pastes", JSON.stringify(state.pastes))
        toast.success('Paste deleted successfully')
      }
    },
    restAllPaste: (state) => {
      state.pastes = []
      searchOrganizationService.removeFromIndex()
      localStorage.removeItem("pastes")
    },
    setCurrentPaste: (state, action) => {
      state.currentPaste = action.payload
    },
    setEncryption: (state, action) => {
      state.isEncrypted = action.payload.isEncrypted
      state.encryptionPassword = action.payload.password || ''
    },
    setSelectedLanguage: (state, action) => {
      state.selectedLanguage = action.payload
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload
    },
    setSearchFilters: (state, action) => {
      state.searchFilters = { ...state.searchFilters, ...action.payload }
    },
    setSortOptions: (state, action) => {
      state.sortOptions = { ...state.sortOptions, ...action.payload }
    },
    setAccessControls: (state, action) => {
      state.accessControls = { ...state.accessControls, ...action.payload }
    },
    addTag: (state, action) => {
      const { pasteId, tag } = action.payload
      const paste = state.pastes.find(p => p._id === pasteId)
      if (paste && !paste.tags.includes(tag)) {
        paste.tags.push(tag)
        searchOrganizationService.indexPaste(paste)
        localStorage.setItem("pastes", JSON.stringify(state.pastes))
      }
    },
    removeTag: (state, action) => {
      const { pasteId, tag } = action.payload
      const paste = state.pastes.find(p => p._id === pasteId)
      if (paste) {
        paste.tags = paste.tags.filter(t => t !== tag)
        searchOrganizationService.indexPaste(paste)
        localStorage.setItem("pastes", JSON.stringify(state.pastes))
      }
    },
    setCategory: (state, action) => {
      const { pasteId, category } = action.payload
      const paste = state.pastes.find(p => p._id === pasteId)
      if (paste) {
        paste.category = category
        searchOrganizationService.indexPaste(paste)
        localStorage.setItem("pastes", JSON.stringify(state.pastes))
      }
    },
    toggleFavorite: (state, action) => {
      const pasteId = action.payload
      if (searchOrganizationService.isFavorited(pasteId)) {
        searchOrganizationService.removeFromFavorites(pasteId)
        toast.success("Removed from favorites")
      } else {
        searchOrganizationService.addToFavorites(pasteId)
        toast.success("Added to favorites")
      }
    },
    incrementViewCount: (state, action) => {
      const pasteId = action.payload
      const paste = state.pastes.find(p => p._id === pasteId)
      if (paste) {
        paste.viewCount = (paste.viewCount || 0) + 1
        paste.lastViewedAt = new Date().toISOString()
        searchOrganizationService.addToRecentlyViewed(pasteId)
        localStorage.setItem("pastes", JSON.stringify(state.pastes))
      }
    },
    setCollaborationStatus: (state, action) => {
      state.collaboration = { ...state.collaboration, ...action.payload }
    },
    updateCollaborationCursors: (state, action) => {
      state.collaboration.cursors = action.payload
    },
    updateCollaborationComments: (state, action) => {
      state.collaboration.comments = action.payload
    },
    initializeServices: (state) => {
      searchOrganizationService.initialize(state.pastes)
    }
  },
})

export const { 
  addToPaste, 
  updateToPaste, 
  removeFromPaste, 
  restAllPaste,
  setCurrentPaste,
  setEncryption,
  setSelectedLanguage,
  setSearchQuery,
  setSearchFilters,
  setSortOptions,
  setAccessControls,
  addTag,
  removeTag,
  setCategory,
  toggleFavorite,
  incrementViewCount,
  setCollaborationStatus,
  updateCollaborationCursors,
  updateCollaborationComments,
  initializeServices
} = pasteSlice.actions

export default pasteSlice.reducer