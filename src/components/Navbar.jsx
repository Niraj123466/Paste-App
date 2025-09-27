import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";

function Navbar() {
  const [theme, setTheme] = useState(() => document.documentElement.classList.contains('light') ? 'light' : 'dark');
  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    localStorage.setItem('theme', theme);
  }, [theme]);
  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/60 bg-background/80 border-b border-white/10">
      <nav className="container-app flex items-center justify-between py-3">
        <NavLink to="/" className="flex items-center gap-3 group">
          <div className="h-9 w-9 rounded-lg bg-primary-600/20 ring-1 ring-primary-500/30 grid place-items-center">
            <span className="text-primary-400 font-extrabold">P</span>
          </div>
          <span className="text-lg font-semibold tracking-tight">PasteApp</span>
        </NavLink>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            aria-label="Toggle theme"
            className="btn-secondary"
            onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
          >
            {theme === 'light' ? 'Dark' : 'Light'}
          </button>
          <NavLink
            to="/"
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary-600 text-white"
                  : "text-foreground-muted hover:text-foreground hover:bg-background-soft"
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/pastes"
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary-600 text-white"
                  : "text-foreground-muted hover:text-foreground hover:bg-background-soft"
              }`
            }
          >
            Pastes
          </NavLink>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
