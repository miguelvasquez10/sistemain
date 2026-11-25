import { FolderKanban, Grid2X2, Home, Info, LogOut, Plus, ClipboardList } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";

function Header({ projects = [] }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const linkClass = ({ isActive }) => `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition ${isActive ? "bg-blue-500/20 text-white ring-1 ring-inset ring-blue-400/40" : "text-slate-300 hover:bg-white/5 hover:text-white"}`;

  return (
    <>
      <div className="flex h-16 items-center justify-between border-b border-white/10 bg-[#0b223b] px-5 md:hidden">
        <button onClick={() => navigate("/projects")} className="flex items-center gap-3 text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-bold">V</span>
          <span className="font-semibold">Sistema V Ingeniería</span>
        </button>
        <button onClick={logout} aria-label="Cerrar sesión" className="rounded p-2 text-slate-200"><LogOut size={19} /></button>
      </div>
      <aside className="hidden h-screen w-[280px] shrink-0 flex-col border-r-2 border-blue-500 bg-[#0b223b] text-slate-200 md:sticky md:top-0 md:flex">
        <button onClick={() => navigate("/projects")} className="flex h-[88px] items-center gap-3 border-b border-white/10 px-6 text-left">
          <span className="flex h-12 w-12 items-center justify-center rounded-sm border border-blue-400 bg-blue-500/10 text-3xl font-bold text-white">V</span>
          <span><span className="block text-lg font-bold text-white">Sistema V Ingeniería</span><span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Control de proyectos</span></span>
        </button>
        <div className="px-5 pt-8">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Espacio de trabajo</p>
          <NavLink to="/projects" end className={linkClass}><Grid2X2 size={17} /> Portafolio</NavLink>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-3 pt-7">
          <div className="mb-2 flex items-center justify-between px-2">
            <p className="text-xs font-semibold text-slate-400">Mis proyectos</p>
            <button onClick={() => navigate("/projects?nuevo=1")} aria-label="Crear proyecto" className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white"><Plus size={18} /></button>
          </div>
          <nav className="space-y-1">
            {projects.map((project) => (
              <NavLink key={project.id} to={`/projects/${project.id}`} title={project.name} className={({ isActive }) => `flex items-center gap-3 truncate rounded-sm border-l-2 px-3 py-2.5 text-xs transition ${isActive ? "border-blue-400 bg-blue-400/15 font-semibold text-white" : "border-transparent text-slate-300 hover:bg-white/5 hover:text-white"}`}>
                <span className="h-2.5 w-2.5 shrink-0 rounded-sm bg-sky-400" /><span className="truncate">{project.name}</span>
              </NavLink>
            ))}
            {!projects.length && <p className="px-3 py-3 text-xs text-slate-500">Aún no hay proyectos</p>}
          </nav>
        </div>
        <div className="space-y-1 border-t border-white/10 p-3">
          <NavLink to="/informacion" className={linkClass}><Info size={17} /> Información</NavLink>
          {user?.role === "ADMIN" && <NavLink to="/admin/create-form" className={linkClass}><ClipboardList size={17} /> Administración</NavLink>}
          <div className="mt-4 flex items-center gap-3 border-t border-white/10 px-3 pt-4">
            <span className="h-3 w-3 rounded-sm bg-teal-400" />
            <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-white">{user?.name || "Usuario"}</p><p className="text-[11px] text-slate-400">Sesión activa</p></div>
            <button onClick={logout} title="Cerrar sesión" className="rounded p-2 text-slate-400 hover:bg-white/10 hover:text-white"><LogOut size={17} /></button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Header;
