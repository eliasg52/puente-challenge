import { NavLink } from "react-router-dom";
import useAuthStore from "../../store/authStore";

const Sidebar = () => {
  const { user } = useAuthStore();

  return (
    <aside className="bg-[#171924] shadow-md w-64 min-h-screen pt-4 border-r border-gray-800">
      <div className="px-4 py-2">
        <h3 className="text-lg font-semibold text-white">Menú</h3>
      </div>

      <nav className="mt-6">
        <ul className="space-y-1">
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `px-4 py-2 flex items-center ${
                  isActive
                    ? "bg-[#222531] text-[#3861fb] border-l-4 border-[#3861fb]"
                    : "text-gray-300 hover:bg-[#222531]"
                }`
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <span className="ml-2">Dashboard</span>
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/market"
              className={({ isActive }) =>
                `px-4 py-2 flex items-center ${
                  isActive
                    ? "bg-[#222531] text-[#3861fb] border-l-4 border-[#3861fb]"
                    : "text-gray-300 hover:bg-[#222531]"
                }`
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              <span className="ml-2">Mercado</span>
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/favorites"
              className={({ isActive }) =>
                `px-4 py-2 flex items-center ${
                  isActive
                    ? "bg-[#222531] text-[#3861fb] border-l-4 border-[#3861fb]"
                    : "text-gray-300 hover:bg-[#222531]"
                }`
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="ml-2">Favoritos</span>
            </NavLink>
          </li>

          {user?.role === "admin" && (
            <li>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `px-4 py-2 flex items-center ${
                    isActive
                      ? "bg-[#222531] text-[#3861fb] border-l-4 border-[#3861fb]"
                      : "text-gray-300 hover:bg-[#222531]"
                  }`
                }
              >
                <span className="ml-2">Administración</span>
              </NavLink>
            </li>
          )}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
