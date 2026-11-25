import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, User, HardHat } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function Register() {
  const navigate = useNavigate();

  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    const { name, email, password, confirmPassword } = formData;

    if (!name || !email || !password || !confirmPassword) {
      return setError("Todos los campos son obligatorios");
    }

    if (password.length < 6) {
      return setError("La contraseña debe tener mínimo 6 caracteres");
    }

    if (password !== confirmPassword) {
      return setError("Las contraseñas no coinciden");
    }

    try {
      setLoading(true);

      await axios.post(`${API_URL}/users/register`, {
        name,
        email,
        password,
      });

      navigate("/");
    } catch (err) {
      console.error(err);

      if (err.response?.status === 409) {
        setError("El correo ya está registrado");
      } else {
        setError("Error al crear la cuenta");
      }
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
            <HardHat className="w-7 h-7 text-blue-600" />
          </div>

        </div>

        <h1 className="text-2xl font-bold text-white">
          Sistema V Ingeniería
        </h1>

        <p className="text-blue-100 text-sm mt-2">
          Plataforma de gestión para proyectos de ingeniería civil
        </p>

      </div>

      {/* FORMULARIO */}
      <div className="px-8 pt-12 pb-8">

        <h2 className="text-center text-lg font-semibold text-slate-700 mb-6">
          Crear cuenta
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* NOMBRE */}
          <div className="relative">

            <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-400"/>

            <input
              type="text"
              name="name"
              placeholder="Nombre completo"
              value={formData.name}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200
              focus:ring-2 focus:ring-blue-500 focus:border-transparent
              outline-none text-sm"
            />

          </div>

          {/* EMAIL */}
          <div className="relative">

            <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400"/>

            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={formData.email}
              onChange={handleChange}
              required
              pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200
              focus:ring-2 focus:ring-blue-500 focus:border-transparent
              outline-none text-sm"
            />

          </div>

          {/* PASSWORD */}
          <div className="relative">

            <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400"/>

            <input
              type={showPass ? "text" : "password"}
              name="password"
              placeholder="Contraseña"
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-10 pr-10 py-3 rounded-lg border border-slate-200
              focus:ring-2 focus:ring-blue-500 focus:border-transparent
              outline-none text-sm"
            />

          </div>

          {/* CONFIRM PASSWORD */}
          <div className="relative">

            <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400"/>

            <input
              type={showPass ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirmar contraseña"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full pl-10 pr-10 py-3 rounded-lg border border-slate-200
              focus:ring-2 focus:ring-blue-500 focus:border-transparent
              outline-none text-sm"
            />

            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              {showPass ? <Eye size={18}/> : <EyeOff size={18}/> }
            </button>

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
            {loading ? "Creando cuenta..." : "Registrarse"}
          </button>

        </form>

        {/* LOGIN */}
        <div className="text-center mt-6 text-sm">

          <span className="text-slate-500">
            ¿Ya tienes una cuenta?
          </span>

          <Link
            to="/"
            className="ml-2 text-blue-600 font-semibold hover:underline"
          >
            Iniciar sesión
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

export default Register;