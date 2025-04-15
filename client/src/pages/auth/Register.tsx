import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as authService from "../../services/auth.service";

// Componente Spinner para el loader
const Spinner = () => (
  <svg
    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.email || !formData.password) {
      setError("Por favor completa todos los campos");
      return;
    }

    setIsLoading(true);
    try {
      await authService.register(formData);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrarse");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-[#171924] p-8 rounded-lg shadow-lg border border-gray-800">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 mb-4">
            <svg
              version="1.0"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 200 200"
              className="w-full h-full"
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
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">
            Puente Inversiones
          </h1>
          <h2 className="text-xl font-medium text-gray-300">Crear cuenta</h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-900 border border-red-800 text-red-100 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="rounded-md -space-y-px">
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Nombre
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-700 bg-[#222531] placeholder-gray-500 text-white focus:outline-none focus:ring-[#3861fb] focus:border-[#3861fb] focus:z-10 sm:text-sm"
                placeholder="Nombre completo"
                disabled={isLoading}
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-700 bg-[#222531] placeholder-gray-500 text-white focus:outline-none focus:ring-[#3861fb] focus:border-[#3861fb] focus:z-10 sm:text-sm"
                placeholder="Correo electrónico"
                disabled={isLoading}
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-700 bg-[#222531] placeholder-gray-500 text-white focus:outline-none focus:ring-[#3861fb] focus:border-[#3861fb] focus:z-10 sm:text-sm"
                placeholder="Contraseña"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#3861fb] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Spinner />
                  Creando cuenta...
                </>
              ) : (
                "Registrarse"
              )}
            </button>
          </div>

          <div className="text-center text-sm text-gray-400">
            ¿Ya tienes una cuenta?{" "}
            <Link
              to="/login"
              className="font-medium text-[#3861fb] hover:text-blue-500"
            >
              Inicia sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
