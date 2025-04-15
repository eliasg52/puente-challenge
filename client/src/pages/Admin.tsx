import { useState, useEffect } from "react";
import useAuthStore from "../store/authStore";
import { User } from "../types/auth";
import { getAllUsers, deleteUser } from "../services/auth.service";

const Admin = () => {
  const { user } = useAuthStore();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar usuarios
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllUsers();
      setUsers(response.users);
      setLastUpdated(new Date());
    } catch (err) {
      setError("Error al cargar los usuarios");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Eliminar usuario
  const handleDeleteUser = async (userId: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      return;
    }

    try {
      setLoading(true);
      await deleteUser(userId);
      // Recargar la lista después de eliminar
      fetchUsers();
    } catch (err) {
      setError("Error al eliminar el usuario");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="py-6">
      <h1 className="text-2xl font-bold text-white">Administración</h1>
      {lastUpdated && (
        <div className="text-xs text-gray-400 mt-1">
          Última actualización: {lastUpdated.toLocaleTimeString()}
        </div>
      )}

      <div className="mt-6 bg-[#171924] rounded-lg shadow-md p-6 border border-gray-800">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white">
            Panel de administración
          </h2>
          <p className="text-gray-400 mt-1">
            Bienvenido al panel de administración, {user?.name}
          </p>
        </div>

        <div className="bg-[#171924] rounded-lg shadow-md p-4 border border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">
              Gestión de usuarios
            </h2>
            <button
              onClick={fetchUsers}
              className="bg-[#3861fb] hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm transition-colors"
            >
              Actualizar
            </button>
          </div>

          {error && (
            <div className="bg-red-500 bg-opacity-20 text-red-300 p-3 rounded-md mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-4 text-gray-400">Cargando...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-4 text-gray-400">
              No hay usuarios para mostrar
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Fecha de creación
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[#171924] divide-y divide-gray-700">
                  {users.map((userData) => (
                    <tr key={userData.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {userData.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {userData.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {userData.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            userData.role === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {userData.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(userData.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {/* No mostrar botón de eliminar para el propio usuario */}
                        {userData.id !== user?.id && (
                          <button
                            onClick={() => handleDeleteUser(userData.id)}
                            className="text-red-400 hover:text-red-500"
                            disabled={loading}
                          >
                            Eliminar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
