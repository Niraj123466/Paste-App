
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import Paste from './components/Paste'
import Home from './components/Home'
import ViewPaste from './components/ViewPaste'
import CollaborationPanel from './components/CollaborationPanel'

function App() {

  return (
    <div className='min-h-screen bg-background'>
      <BrowserRouter>
        <Navbar/>
        <main className='container-app py-6'>
          <Routes>
            <Route path='/' element={<Home/>}/>
            <Route path='/pastes' element={<Paste/>}/>
            <Route path='/pastes/:pasteId' element={<ViewPaste/>}/>
            <Route path='/collaborate/:pasteId' element={
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <ViewPaste/>
                </div>
                <div>
                  <CollaborationPanel/>
                </div>
              </div>
            }/>
          </Routes>
        </main>
      </BrowserRouter>
    </div>
  )
}

export default App
