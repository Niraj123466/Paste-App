
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import Paste from './components/Paste'
import Home from './components/Home'
import ViewPaste from './components/ViewPaste'

function App() {

  return (
    <div className='bg-[#09090B]'>
    <BrowserRouter>
    <Navbar/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/pastes' element={<Paste/>}/>
        <Route path='/pastes/:pasteId' element={<ViewPaste/>}/>
      </Routes>
    </BrowserRouter>
    </div>
  )
}

export default App
