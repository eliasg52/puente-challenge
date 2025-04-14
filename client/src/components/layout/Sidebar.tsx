import { NavLink } from "react-router-dom";
import useAuthStore from "../../store/authStore";

const Sidebar = () => {
  const { user } = useAuthStore();

  return (
    <aside className="bg-white shadow-md w-64 min-h-screen pt-4">
      <div className="px-4 py-2">
        <h3 className="text-lg font-semibold text-gray-700">Menú</h3>
      </div>

      <nav className="mt-6">
        <ul className="space-y-1">
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `px-4 py-2 flex items-center ${
                  isActive
                    ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`
              }
            >
              <span className="ml-2">Dashboard</span>
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/market"
              className={({ isActive }) =>
                `px-4 py-2 flex items-center ${
                  isActive
                    ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`
              }
            >
              <span className="ml-2">Mercado</span>
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/favorites"
              className={({ isActive }) =>
                `px-4 py-2 flex items-center ${
                  isActive
                    ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`
              }
            >
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
                      ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                      : "text-gray-600 hover:bg-gray-50"
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
