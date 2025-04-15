import { Link } from "react-router-dom";
import useAuthStore from "../../store/authStore";

const Navbar = () => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-[#171924] text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <svg
            version="1.0"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 200 200"
            className="w-8 h-8"
          >
            <g
              transform="translate(0.000000,200.000000) scale(0.100000,-0.100000)"
              fill="#3861fb"
              stroke="none"
            >
              <path
                d="M862 1930 c-305 -43 -596 -261 -719 -538 -101 -229 -109 -510 -20
              -730 118 -293 378 -514 679 -576 100 -21 286 -21 386 0 165 34 323 117 450
              238 125 119 206 252 259 423 24 79 27 104 27 248 1 127 -3 174 -18 230 -112
              415 -454 692 -876 710 -58 2 -133 0 -168 -5z m348 -434 c41 -7 96 -24 123 -36
              122 -58 173 -205 112 -327 -52 -103 -159 -152 -352 -160 -119 -6 -123 -5 -123
              15 0 19 7 20 94 24 109 4 138 18 171 84 28 55 29 241 2 296 -30 59 -80 78
              -210 78 l-107 0 0 -397 c1 -368 6 -472 25 -491 3 -4 34 -9 68 -12 49 -4 63 -9
              65 -22 3 -17 -14 -18 -242 -18 -239 0 -246 1 -246 20 0 17 7 20 48 20 93 0 87
              -32 90 464 l3 436 -71 0 c-63 0 -70 2 -70 20 0 20 7 20 273 20 182 -1 297 -5
              347 -14z"
              />
            </g>
          </svg>
          <Link to="/" className="text-xl font-bold text-white">
            Puente Inversiones
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-gray-300">
                Bienvenido,{" "}
                <span className="font-semibold text-white">{user.name}</span>
              </span>
              <button
                onClick={handleLogout}
                className="bg-[#3861fb] hover:bg-blue-600 px-3 py-1 rounded-md text-sm transition-colors"
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
