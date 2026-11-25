import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, HardHat } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/Authcontext";

const API_URL = import.meta.env.VITE_API_URL;

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      return setError("Debes ingresar correo y contraseña");
    }

    try {
      setLoading(true);

      const response = await axios.post(`${API_URL}/users/login`, {
        email: formData.email,
        password: formData.password,
      });

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      login(token, user);
      navigate("/projects");
    } catch (err) {
      console.error(err);
      setError("Correo o contraseña incorrectos");

      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  };

  return (
<div className="relative min-h-screen flex items-center justify-center overflow-hidden px-6">

  {/* FONDO */}
  <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800"></div>

  {/* LUCES DECORATIVAS */}
  <div className="absolute inset-0 opacity-20">
    <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
    <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
  </div>

  {/* CARD */}
  <div className="relative w-full max-w-md">

    <div className="bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 pt-10 pb-16 text-center relative">

        {/* ICONO */}
        <div className="absolute left-1/2 -bottom-8 -translate-x-1/2">

          <div className="bg-white shadow-lg rounded-xl p-4 border border-slate-200">
            <HardHat className="w-7 h-7 text-blue-600"/>
          </div>

        </div>

        <h1 className="text-2xl font-bold text-white">
          Sistema V Ingeniería
        </h1>

        <p className="text-blue-100 text-sm mt-2">
          Gestión profesional de proyectos de ingeniería civil
        </p>

      </div>

      {/* FORM */}
      <div className="px-8 pt-12 pb-8">

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* EMAIL */}
          <div>

            <label className="text-sm font-medium text-slate-600">
              Correo electrónico
            </label>

            <div className="relative mt-1">

              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400"/>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ejemplo@correo.com"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                outline-none transition text-sm"
              />

            </div>

          </div>

          {/* PASSWORD */}
          <div>

            <label className="text-sm font-medium text-slate-600">
              Contraseña
            </label>

            <div className="relative mt-1">

              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400"/>

              <input
                type={showPass ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 rounded-lg border border-slate-200
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                outline-none transition text-sm"
              />

              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPass ? <Eye size={18}/> : <EyeOff size={18}/> }
              </button>

            </div>

          </div>

          {/* ERROR */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2 text-center">
              {error}
            </div>
          )}

          {/* BOTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-gradient-to-r
            from-blue-600 to-blue-700
            text-white font-semibold text-sm
            hover:from-blue-700 hover:to-blue-800
            transition shadow-md"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>

        </form>

        {/* LINKS */}
        <div className="flex justify-between mt-6 text-sm">

          <Link
            to="/forgot-password"
            className="text-slate-500 hover:text-blue-600 transition"
          >
            ¿Olvidaste tu contraseña?
          </Link>

          <Link
            to="/register"
            className="text-blue-600 font-medium hover:underline"
          >
            Crear cuenta
          </Link>

        </div>

      </div>

    </div>

    {/* FOOTER */}
    <p className="text-center text-xs text-blue-200 mt-6">
      © {new Date().getFullYear()} Sistema V Ingeniería
    </p>

  </div>

</div>
  );
}

export default Login;