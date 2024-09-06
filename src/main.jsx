import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { store } from "./redux/store.js"
import { Provider } from 'react-redux'
import  { Toaster } from 'react-hot-toast';

// Initialize theme early
const persistedTheme = localStorage.getItem('theme');
const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
const initialTheme = persistedTheme ? persistedTheme : (prefersLight ? 'light' : 'dark');
document.documentElement.classList.toggle('light', initialTheme === 'light');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
    <App />
    <Toaster/>
    </Provider>
  </StrictMode>,
)
