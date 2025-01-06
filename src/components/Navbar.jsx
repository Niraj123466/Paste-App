import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav className="flex bg-blue-950 text-white items-center justify-center gap-10 font-bold py-4 px-8 shadow-lg">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `text-lg px-4 py-2 rounded-md transition-all duration-200 ${
            isActive
              ? "bg-orange-500 text-black"
              : "hover:bg-orange-400 hover:text-black"
          }`
        }
      >
        Home
      </NavLink>
      <NavLink
        to="/pastes"
        className={({ isActive }) =>
          `text-lg px-4 py-2 rounded-md transition-all duration-200 ${
            isActive
              ? "bg-orange-500 text-black"
              : "hover:bg-orange-400 hover:text-black"
          }`
        }
      >
        Pastes
      </NavLink>
    </nav>
  );
}

export default Navbar;
