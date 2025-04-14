import { Link } from "react-router-dom";
import useAuthStore from "../../store/authStore";

const Navbar = () => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          Financial Markets App
        </Link>

        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-4">
              <span>
                Bienvenido, <span className="font-semibold">{user.name}</span>
              </span>
              <button
                onClick={handleLogout}
                className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded-md text-sm transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
