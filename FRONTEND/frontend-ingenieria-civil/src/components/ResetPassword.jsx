import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!password || !confirm) {
      return setError("Debes completar todos los campos");
    }

    if (password !== confirm) {
      return setError("Las contraseñas no coinciden");
    }

    if (!token) {
      return setError("Token inválido");
    }

    try {
      setLoading(true);

      const response = await axios.post(`${API_URL}/password/reset`, {
        token,
        password,
      });

      setMessage(response.data.message);

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Token inválido o expirado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      
      {/* Fondo */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}audi.png)` }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-[#0A6A50]/70 z-0" />

      {/* CONTENIDO */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10">
        
        <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6 sm:p-8">
          
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#0A6A50]">
              Restablecer contraseña
            </h2>

            <p className="text-sm text-gray-600 mt-3">
              Ingresa tu nueva contraseña para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-2.5 px-3 border border-gray-300 rounded-md
                         focus:outline-none focus:ring-2 focus:ring-[#0A6A50]
                         text-sm"
            />

            <input
              type="password"
              placeholder="Confirmar contraseña"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full py-2.5 px-3 border border-gray-300 rounded-md
                         focus:outline-none focus:ring-2 focus:ring-[#0A6A50]
                         text-sm"
            />

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            {message && (
              <p className="text-green-600 text-sm text-center">{message}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0A6A50] text-white py-2.5 rounded-md
                         font-semibold uppercase text-sm
                         hover:bg-[#085c45] transition
                         disabled:opacity-60"
            >
              {loading ? "Actualizando..." : "Cambiar contraseña"}
            </button>
          </form>
        </div>
      </main>

      {/* FOOTER INTEGRADO */}
      <footer className="relative z-10 bg-white/95 backdrop-blur-sm">
        <div className="w-11/12 xl:w-5/6 mx-auto px-4 py-6">
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

            {/* IZQUIERDA */}
            <div className="flex items-center space-x-3 justify-center lg:justify-start">
              <img
                src={`${import.meta.env.BASE_URL}logo.jpeg`}
                alt="Logo Colegio Mayor de Antioquia"
                className="w-10 h-10 object-contain"
              />

              <div className="leading-tight text-center lg:text-left">
                <p className="text-sm font-semibold text-[#0A6A50]">
                  Colegio Mayor de Antioquia
                </p>
                <p className="text-xs text-gray-500">
                  Institución Universitaria
                </p>
              </div>
            </div>

            {/* CENTRO */}
            <div className="flex justify-center gap-4 text-xs text-gray-500">
              <a
                href="https://www.colmayor.edu.co"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#0A6A50] transition"
              >
                Colmayor
              </a>

              <a
                href="https://www.medellin.gov.co"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#0A6A50] transition"
              >
                Medellín
              </a>

              <a
                href="https://www.gov.co"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#0A6A50] transition"
              >
                Gov.co
              </a>
            </div>

            {/* DERECHA */}
            <div className="text-xs text-gray-500 text-center lg:text-right">
              <p>
                © {new Date().getFullYear()} Todos los derechos reservados.
              </p>
              <p>
                Desarrollado por{" "}
                <span className="font-medium text-[#0A6A50]">
                  Simón Peláez Loaiza
                </span>
              </p>
            </div>

          </div>
        </div>
      </footer>

    </div>
  );
}

export default ResetPassword;
