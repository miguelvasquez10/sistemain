import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext, useSearchParams } from "react-router-dom";
import { FolderKanban, FolderPlus, MapPin, Plus, Search, CalendarDays, ListTodo, X } from "lucide-react";
import axiosClient from "../api/axiosClient";

const dateLabel = (value) => value ? new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value)) : "Sin fecha";

function ProjectsPage() {
  const navigate = useNavigate();
  const { projects, refreshProjects } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", location: "", startDate: "", endDate: "", budget: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (searchParams.get("nuevo") === "1") {
      setCreateOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const filteredProjects = useMemo(() => projects.filter((project) => `${project.name} ${project.location || ""}`.toLowerCase().includes(search.toLowerCase())), [projects, search]);
  const openCreate = () => { setError(""); setCreateOpen(true); };
  const closeCreate = () => { setCreateOpen(false); setError(""); };
  const updateForm = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const createProject = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) { setError("Escribe el nombre del proyecto."); return; }
    if (form.startDate && form.endDate && form.endDate < form.startDate) { setError("La fecha final debe ser posterior a la inicial."); return; }
    setSaving(true);
    setError("");
    try {
      const response = await axiosClient.post("/projects", form);
      await refreshProjects();
      closeCreate();
      setForm({ name: "", description: "", location: "", startDate: "", endDate: "", budget: "" });
      navigate(`/projects/${response.data.id}`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "No se pudo crear el proyecto. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-5 py-8 md:px-8 lg:px-10">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-700">Espacio de trabajo</p><h1 className="text-3xl font-bold tracking-tight text-[#102f53]">Mis proyectos</h1><p className="mt-2 text-sm text-slate-500">Gestiona el avance y la información de tus obras desde un solo lugar.</p></div>
          <div className="flex items-center gap-3">
            <div className="rounded-md border border-blue-100 bg-blue-50 px-5 py-3"><p className="text-xs text-slate-500">Total proyectos</p><p className="text-2xl font-bold text-[#102f53]">{projects.length}</p></div>
            <button onClick={openCreate} className="flex items-center gap-2 rounded-sm bg-blue-700 px-4 py-3 text-xs font-bold uppercase tracking-wide text-white shadow-sm hover:bg-blue-800"><Plus size={16} /> Nuevo proyecto</button>
          </div>
        </div>

        <section className="mb-7 rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-[#102f53]"><FolderPlus size={19} className="text-blue-600"/><h2 className="font-semibold">Portafolio de proyectos</h2></div>
          <label className="flex max-w-xl items-center gap-3 rounded border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-blue-400"><Search size={18} className="text-slate-400"/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar proyecto o ubicación..." className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" /></label>
        </section>

        {filteredProjects.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <FolderKanban size={42} className="mx-auto mb-4 text-blue-300"/><h2 className="font-semibold text-[#102f53]">{search ? "No encontramos proyectos" : "Crea tu primer proyecto"}</h2><p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{search ? "Prueba con otro nombre o ubicación." : "Añade los datos básicos de la obra y luego registra las actividades de su cronograma."}</p>
            {!search && <button onClick={openCreate} className="mt-5 rounded-sm bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800">Crear proyecto</button>}
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {filteredProjects.map((project) => (
              <button key={project.id} onClick={() => navigate(`/projects/${project.id}`)} className="group rounded-md border border-slate-200 border-t-[3px] border-t-blue-700 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between gap-4"><div className="flex min-w-0 items-start gap-3"><span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded bg-blue-50 text-blue-700"><FolderKanban size={20}/></span><div className="min-w-0"><h3 className="truncate text-base font-bold text-[#102f53] group-hover:text-blue-700">{project.name}</h3><p className="mt-1 line-clamp-2 text-sm text-slate-500">{project.description || "Sin descripción"}</p></div></div><span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase text-slate-500">{project.accessRole === "VIEWER" ? "Lectura" : "Activo"}</span></div>
                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500"><span className="inline-flex items-center gap-1.5"><MapPin size={14}/>{project.location || "Ubicación sin definir"}</span><span className="inline-flex items-center gap-1.5"><CalendarDays size={14}/>{dateLabel(project.startDate)} — {dateLabel(project.endDate)}</span><span className="inline-flex items-center gap-1.5"><ListTodo size={14}/>{project._count?.tasks || 0} actividades</span></div>
              </button>
            ))}
          </div>
        )}
      </div>

      {isCreateOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={(event) => event.target === event.currentTarget && closeCreate()}>
        <section className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-md bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5"><div><h2 className="text-lg font-bold text-[#102f53]">Crear nuevo proyecto</h2><p className="mt-1 text-sm text-slate-500">Podrás agregar actividades y compartir el seguimiento después.</p></div><button onClick={closeCreate} className="rounded p-2 text-slate-400 hover:bg-slate-100" aria-label="Cerrar"><X size={19}/></button></div>
          <form onSubmit={createProject} className="grid gap-4 p-6 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700 sm:col-span-2">Nombre del proyecto<input name="name" value={form.name} onChange={updateForm} required maxLength={150} className="mt-1.5 w-full rounded border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Ej. Ampliación de vía regional"/></label>
            <label className="text-sm font-medium text-slate-700 sm:col-span-2">Descripción<textarea name="description" value={form.description} onChange={updateForm} rows={2} className="mt-1.5 w-full rounded border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Alcance general de la obra"/></label>
            <label className="text-sm font-medium text-slate-700 sm:col-span-2">Ubicación<input name="location" value={form.location} onChange={updateForm} className="mt-1.5 w-full rounded border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Municipio, departamento"/></label>
            <label className="text-sm font-medium text-slate-700">Fecha de inicio<input name="startDate" type="date" value={form.startDate} onChange={updateForm} className="mt-1.5 w-full rounded border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-blue-500"/></label>
            <label className="text-sm font-medium text-slate-700">Fecha de finalización<input name="endDate" type="date" value={form.endDate} onChange={updateForm} className="mt-1.5 w-full rounded border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-blue-500"/></label>
            <label className="text-sm font-medium text-slate-700 sm:col-span-2">Presupuesto planificado (COP)<input name="budget" type="number" min="0" step="0.01" value={form.budget} onChange={updateForm} className="mt-1.5 w-full rounded border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-blue-500" placeholder="Opcional"/></label>
            {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2">{error}</p>}
            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 sm:col-span-2"><button type="button" onClick={closeCreate} className="rounded border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600">Cancelar</button><button disabled={saving} className="rounded bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60">{saving ? "Creando..." : "Crear proyecto"}</button></div>
          </form>
        </section>
      </div>}
    </div>
  );
}

export default ProjectsPage;
