import { createSlice } from '@reduxjs/toolkit'
import toast from 'react-hot-toast';

const initialState = {
  pastes: localStorage.getItem("pastes") ? JSON.parse(localStorage.getItem("pastes")):[] ,
}

export const pasteSlice = createSlice({
  name: 'paste',
  initialState,
  reducers: {
    addToPaste: (state, action) => {
      // fetch the toast details
      // check if the toast already exists or not
      // update the arr
      // update the localstorage
      const paste = action.payload
      const idx = state.pastes.findIndex((item) => item._id === paste._id)
      if(idx >= 0) {
        toast.error("Toast already exists")
        return
      }
      state.pastes.push(action.payload)

      localStorage.setItem("pastes", JSON.stringify(state.pastes)) // while storing we have store it in form of string
      toast.success("Toast created")
    },
    updateToPaste: (state, action) => {
      // fetch the paste from frontend
      // check if it exists if not error
      // update the paste
      // update the localstorage

      const paste = action.payload
      const idx = state.pastes.findIndex((item) => item._id === paste._id)
      if(idx < 0) {
        toast.error("Unable to update paste")
        return
      }      

      state.pastes[idx] = paste
      localStorage.setItem("pastes", JSON.stringify(state.pastes))
      toast.success("Toast updated")
    },
    removeFromPaste: (state, action) => {
        // fetch the id of paste to be deleted
        // check if paste corresponding to id exists or not
        // update the pastes
        //update the localstorage
        const pasteId = action.payload
        if(!pasteId) {
          toast.error("Unable to delete paste")
          return
        }
        state.pastes.splice(pasteId, 1)
        localStorage.setItem("pastes", JSON.stringify(state.pastes))
        toast.success('Paste deleted')
    },
    restAllPaste : (state) => {
      state.pastes = []
      localStorage.removeItem("pastes")
    }
  },
})

export const { addToPaste, updateToPaste, removeFromPaste, restAllPaste } = pasteSlice.actions

export default pasteSlice.reducer