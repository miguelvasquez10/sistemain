import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { Activity, ArrowLeft, CalendarDays, CircleDollarSign, Edit3, ListTodo, MapPin, Plus, Save, Share2, Trash2, Users, X } from "lucide-react";
import axiosClient from "../api/axiosClient";

const emptyTask = { name: "", description: "", assignedTo: "", startDate: "", endDate: "", progress: 0, status: "PENDING", priority: "NORMAL", plannedCost: "0", actualCost: "0", predecessorIds: [] };
const states = { PENDING: "Pendiente", IN_PROGRESS: "En curso", COMPLETED: "Completada", BLOCKED: "Bloqueada" };
const priorities = { LOW: "Baja", NORMAL: "Normal", HIGH: "Alta", CRITICAL: "Crítica" };
const money = (n) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(Number(n || 0));
const dateInput = (v) => v ? new Date(v).toISOString().slice(0, 10) : "";
const dateText = (v) => v ? new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", year: "numeric" }).format(new Date(v)) : "Sin fecha";
const input = "mt-1.5 w-full rounded border border-slate-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
const xmlEscape = (value) => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
const xmlDate = (value) => value ? `${dateInput(value)}T08:00:00` : "";
const xmlValue = (node, tag) => {
  const found = Array.from(node.getElementsByTagNameNS("*", tag))[0] || Array.from(node.getElementsByTagName(tag))[0];
  return found?.textContent?.trim() || "";
};

function createTimeline(project, tasks) {
  const dates = [project?.startDate, project?.endDate, ...tasks.flatMap((task) => [task.startDate, task.endDate])].filter(Boolean).map((date) => new Date(date));
  const now = new Date();
  const first = dates.length ? new Date(Math.min(...dates.map((date) => date.getTime()))) : now;
  let last = dates.length ? new Date(Math.max(...dates.map((date) => date.getTime()))) : new Date(now.getFullYear(), now.getMonth() + 5, 1);
  if (last <= first) last = new Date(first.getFullYear(), first.getMonth() + 1, 1);
  const start = new Date(first.getFullYear(), first.getMonth(), 1);
  const end = new Date(last.getFullYear(), last.getMonth() + 1, 1);
  const days = Math.ceil((end - start) / 86400000);
  const months = [];
  const cursor = new Date(start);
  while (cursor < end && months.length < 48) {
    months.push(new Intl.DateTimeFormat("es-CO", { month: "short", year: "numeric" }).format(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return { start, end, days, months };
}

function ProjectDashboardPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { refreshProjects } = useOutletContext();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [taskModal, setTaskModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [taskForm, setTaskForm] = useState(emptyTask);
  const [saving, setSaving] = useState(false);
  const [projectModal, setProjectModal] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: "", description: "", location: "", startDate: "", endDate: "", budget: "" });
  const [shareModal, setShareModal] = useState(false);
  const [owner, setOwner] = useState(null);
  const [members, setMembers] = useState([]);
  const [memberForm, setMemberForm] = useState({ email: "", role: "VIEWER" });
  const [shareError, setShareError] = useState("");
  const [notice, setNotice] = useState("");
  const xmlInputRef = useRef(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [p, t] = await Promise.all([axiosClient.get(`/projects/${projectId}`), axiosClient.get(`/projects/${projectId}/tasks`)]);
      setProject(p.data); setTasks(t.data);
      setProjectForm({ name: p.data.name || "", description: p.data.description || "", location: p.data.location || "", startDate: dateInput(p.data.startDate), endDate: dateInput(p.data.endDate), budget: p.data.budget ?? "" });
    } catch (e) { setError(e.response?.data?.message || "No se pudo cargar el proyecto."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [projectId]);

  const timeline = useMemo(() => createTimeline(project, tasks), [project, tasks]);
  const planned = tasks.reduce((sum, task) => sum + Number(task.plannedCost || 0), 0);
  const actual = tasks.reduce((sum, task) => sum + Number(task.actualCost || 0), 0);
  const completed = tasks.filter((task) => task.status === "COMPLETED" || Number(task.progress) === 100).length;
  const progress = tasks.length ? Math.round(tasks.reduce((sum, task) => sum + Number(task.progress || 0), 0) / tasks.length) : 0;
  const canEdit = ["OWNER", "ADMIN", "EDITOR"].includes(project?.accessRole);
  const canManage = ["OWNER", "ADMIN"].includes(project?.accessRole);

  const newTask = () => { setEditing(null); setTaskForm({ ...emptyTask, startDate: dateInput(project.startDate), endDate: dateInput(project.endDate) }); setTaskModal(true); };
  const editTask = (task) => { setEditing(task); setTaskForm({ ...emptyTask, ...task, startDate: dateInput(task.startDate), endDate: dateInput(task.endDate), plannedCost: String(task.plannedCost ?? 0), actualCost: String(task.actualCost ?? 0), predecessorIds: Array.isArray(task.predecessorIds) ? task.predecessorIds.map(Number) : [] }); setTaskModal(true); };
  const changeTask = (event) => {
    const { name, value } = event.target;
    setTaskForm((current) => {
      if (name === "progress") { const pct = Number(value); return { ...current, progress: pct, status: pct === 100 ? "COMPLETED" : pct > 0 ? "IN_PROGRESS" : "PENDING" }; }
      if (name === "status") return { ...current, status: value, progress: value === "COMPLETED" ? 100 : current.progress };
      return { ...current, [name]: value };
    });
  };
  const saveTask = async (event) => {
    event.preventDefault(); setSaving(true);
    try {
      const body = { ...taskForm, progress: Number(taskForm.progress), plannedCost: Number(taskForm.plannedCost || 0), actualCost: Number(taskForm.actualCost || 0) };
      if (editing) await axiosClient.put(`/projects/${projectId}/tasks/${editing.id}`, body);
      else await axiosClient.post(`/projects/${projectId}/tasks`, body);
      setTaskModal(false); await load(); await refreshProjects();
    } catch (e) { setError(e.response?.data?.message || "No se pudo guardar la actividad."); }
    finally { setSaving(false); }
  };
  const removeTask = async (task) => {
    try { await axiosClient.delete(`/projects/${projectId}/tasks/${task.id}`); await load(); await refreshProjects(); }
    catch (e) { setError(e.response?.data?.message || "No se pudo eliminar la actividad."); }
  };
  const saveProject = async (event) => {
    event.preventDefault();
    try { await axiosClient.put(`/projects/${projectId}`, projectForm); setProjectModal(false); await load(); await refreshProjects(); }
    catch (e) { setError(e.response?.data?.message || "No se pudieron guardar los datos del proyecto."); }
  };
  const loadMembers = async () => {
    setShareError("");
    try { const response = await axiosClient.get(`/projects/${projectId}/members`); setOwner(response.data.owner); setMembers(response.data.members); }
    catch (e) { setShareError(e.response?.data?.message || "No se pudieron cargar los accesos."); }
  };
  const openShare = async () => { setShareModal(true); await loadMembers(); };
  const addMember = async (event) => {
    event.preventDefault(); setShareError("");
    try { await axiosClient.post(`/projects/${projectId}/members`, memberForm); setMemberForm({ email: "", role: "VIEWER" }); await loadMembers(); }
    catch (e) { setShareError(e.response?.data?.message || "No se pudo compartir el proyecto."); }
  };
  const removeMember = async (userId) => {
    try { await axiosClient.delete(`/projects/${projectId}/members/${userId}`); await loadMembers(); }
    catch (e) { setShareError(e.response?.data?.message || "No se pudo retirar el acceso."); }
  };

  const exportXml = () => {
    const taskXml = tasks.map((task, index) => {
      const uid = index + 1;
      const predecessors = (Array.isArray(task.predecessorIds) ? task.predecessorIds : []).map((id) => {
        const predecessorIndex = tasks.findIndex((item) => item.id === Number(id));
        return predecessorIndex < 0 ? "" : `<PredecessorLink><PredecessorUID>${predecessorIndex + 1}</PredecessorUID><Type>1</Type><CrossProject>0</CrossProject><LinkLag>0</LinkLag><LagFormat>7</LagFormat></PredecessorLink>`;
      }).join("");
      const priority = { LOW: 200, NORMAL: 500, HIGH: 800, CRITICAL: 1000 }[task.priority] || 500;
      return `<Task><UID>${uid}</UID><ID>${uid}</ID><Name>${xmlEscape(task.name)}</Name><Type>1</Type><Contact>${xmlEscape(task.assignedTo)}</Contact><WBS>${uid}</WBS><OutlineNumber>${uid}</OutlineNumber><OutlineLevel>1</OutlineLevel><Priority>${priority}</Priority>${task.startDate ? `<Start>${xmlDate(task.startDate)}</Start>` : ""}${task.endDate ? `<Finish>${xmlDate(task.endDate)}</Finish>` : ""}<PercentComplete>${Number(task.progress || 0)}</PercentComplete><Cost>${Number(task.plannedCost || 0).toFixed(2)}</Cost><ActualCost>${Number(task.actualCost || 0).toFixed(2)}</ActualCost><Notes>${xmlEscape(task.description)}</Notes>${predecessors}</Task>`;
    }).join("");
    const start = xmlDate(project.startDate) || `${new Date().toISOString().slice(0, 10)}T08:00:00`;
    const tasksXml = taskXml ? `<Tasks>${taskXml}</Tasks>` : "";
    const xml = `<?xml version="1.0" encoding="UTF-8"?><Project xmlns="http://schemas.microsoft.com/project/2007"><SaveVersion>14</SaveVersion><UID>${project.id}</UID><Name>${xmlEscape(project.name)}</Name><ScheduleFromStart>true</ScheduleFromStart><StartDate>${start}</StartDate><CurrencyDigits>2</CurrencyDigits><CurrencySymbol>COP</CurrencySymbol><CurrencyCode>COP</CurrencyCode>${tasksXml}</Project>`;
    const blob = new Blob([xml], { type: "application/xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${project.name.trim().replace(/[^\p{L}\p{N}-]+/gu, "-") || "proyecto"}.xml`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importXml = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError(""); setNotice("");
    let imported = 0;
    try {
      const text = await file.text();
      const documentXml = new DOMParser().parseFromString(text, "application/xml");
      if (documentXml.querySelector("parsererror")) throw new Error("El archivo no contiene un XML válido.");
      const nodes = Array.from(documentXml.getElementsByTagNameNS("*", "Task"));
      if (!nodes.length) nodes.push(...Array.from(documentXml.getElementsByTagName("Task")));
      const sourceTasks = nodes.map((node) => {
        const name = xmlValue(node, "Name");
        const summary = ["1", "true"].includes(xmlValue(node, "Summary").toLowerCase());
        const uid = xmlValue(node, "UID") || xmlValue(node, "ID");
        const pct = Math.max(0, Math.min(100, Number(xmlValue(node, "PercentComplete") || 0)));
        const priorityNumber = Number(xmlValue(node, "Priority") || 500);
        const priority = priorityNumber >= 900 ? "CRITICAL" : priorityNumber >= 700 ? "HIGH" : priorityNumber < 300 ? "LOW" : "NORMAL";
        const links = Array.from(node.getElementsByTagNameNS("*", "PredecessorLink"));
        const predecessorUids = links.map((link) => xmlValue(link, "PredecessorUID")).filter(Boolean);
        const date = (value) => { if (!value) return ""; const parsed = new Date(value); return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10); };
        return { uid, name, summary, predecessorUids, task: { name, description: xmlValue(node, "Notes"), assignedTo: xmlValue(node, "Contact"), startDate: date(xmlValue(node, "Start")), endDate: date(xmlValue(node, "Finish")), progress: pct, status: pct === 100 ? "COMPLETED" : pct > 0 ? "IN_PROGRESS" : "PENDING", priority, plannedCost: Math.max(0, Number(xmlValue(node, "Cost") || 0)), actualCost: Math.max(0, Number(xmlValue(node, "ActualCost") || 0)), predecessorIds: [] } };
      }).filter((item) => item.name && !item.summary && item.uid !== "0");
      if (!sourceTasks.length) throw new Error("El XML no contiene actividades para importar.");
      const idByUid = new Map();
      for (const item of sourceTasks) {
        const response = await axiosClient.post(`/projects/${projectId}/tasks`, item.task);
        idByUid.set(item.uid, response.data.id);
        imported += 1;
      }
      for (const item of sourceTasks) {
        const predecessorIds = item.predecessorUids.map((uid) => idByUid.get(uid)).filter(Boolean);
        const taskId = idByUid.get(item.uid);
        if (taskId && predecessorIds.length) await axiosClient.put(`/projects/${projectId}/tasks/${taskId}`, { predecessorIds });
      }
      setNotice(`${imported} actividades importadas desde ${file.name}.`);
      await load(); await refreshProjects();
    } catch (e) {
      setError(`${e.response?.data?.message || e.message || "No se pudieron importar las actividades."}${imported ? ` Se alcanzaron a importar ${imported}; revisa el cronograma antes de repetir la carga.` : ""}`);
      if (imported) { await load(); await refreshProjects(); }
    }
  };

  if (loading) return <p className="px-6 py-16 text-center text-slate-500">Cargando proyecto…</p>;
  if (!project) return <div className="mx-auto max-w-3xl px-6 py-16"><p className="rounded border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">{error || "No se encontró el proyecto."}</p><Link to="/projects" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-700"><ArrowLeft size={16}/> Volver al portafolio</Link></div>;

  const getBar = (task) => {
    if (!task.startDate || !task.endDate) return null;
    const start = Math.max(new Date(task.startDate), timeline.start);
    const end = Math.min(new Date(task.endDate), timeline.end);
    if (end < start) return null;
    const left = (start - timeline.start) / 86400000 / timeline.days * 100;
    const width = (Math.max(1, (end - start) / 86400000 + 1) / timeline.days) * 100;
    return { left: `${left}%`, width: `${Math.max(0.8, Math.min(100 - left, width))}%` };
  };
  const barColor = { COMPLETED: "bg-emerald-500", IN_PROGRESS: "bg-blue-600", BLOCKED: "bg-red-500", PENDING: "bg-slate-400" };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-7 md:px-7 lg:px-10">
      <div className="mx-auto max-w-[1700px]">
        <div className="mb-3 flex items-center gap-2 text-xs text-slate-500"><button onClick={() => navigate("/projects")} className="hover:text-blue-700">Portafolio</button><span>/</span><span className="truncate font-semibold text-slate-700">{project.name}</span></div>
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0"><p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-700">Seguimiento del proyecto</p><h1 className="text-2xl font-bold tracking-tight text-[#102f53] md:text-3xl">{project.name} <span className="font-normal text-slate-400">· Cronograma físico y financiero</span></h1><p className="mt-2 text-sm text-slate-500">Consulta el plan y actualiza el avance ejecutado de cada actividad.</p><div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500"><span className="inline-flex items-center gap-1.5"><MapPin size={14}/>{project.location || "Ubicación sin definir"}</span><span className="inline-flex items-center gap-1.5"><CalendarDays size={14}/>{dateText(project.startDate)} — {dateText(project.endDate)}</span><span className="inline-flex items-center gap-1.5 font-semibold text-[#102f53]"><CircleDollarSign size={14}/>Presupuesto: {project.budget ? money(project.budget) : "Sin definir"}</span></div></div>
          <div className="flex shrink-0 flex-wrap gap-2">{canManage && <button onClick={openShare} className="inline-flex items-center gap-2 rounded-sm border border-slate-300 bg-white px-3.5 py-2.5 text-[11px] font-bold uppercase text-slate-700 hover:border-blue-400 hover:text-blue-700"><Share2 size={15}/> Compartir</button>}{canManage && <button onClick={() => setProjectModal(true)} className="inline-flex items-center gap-2 rounded-sm border border-slate-300 bg-white px-3.5 py-2.5 text-[11px] font-bold uppercase text-slate-700 hover:border-blue-400 hover:text-blue-700"><Edit3 size={15}/> Editar proyecto</button>}{canEdit && <Link to={`/projects/${projectId}/services`} className="inline-flex items-center gap-2 rounded-sm border border-slate-300 bg-white px-3.5 py-2.5 text-[11px] font-bold uppercase text-slate-700 hover:border-blue-400 hover:text-blue-700"><Activity size={15}/> Servicios</Link>}</div>
        </div>
        {error && <div className="mb-5 flex items-center justify-between rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><span>{error}</span><button onClick={() => setError("")} aria-label="Cerrar mensaje"><X size={17}/></button></div>}
        {notice && <div className="mb-5 rounded border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}

        <section className="mb-5 grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
          <article className="border border-slate-200 border-t-[3px] border-t-blue-700 bg-white p-5 shadow-sm"><div className="flex items-center justify-between text-sm text-slate-600"><span>Avance general</span><span className="rounded bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700">{tasks.length ? `${progress}%` : "Sin reporte"}</span></div><p className="mt-4 text-2xl font-bold text-[#102f53]">{tasks.length ? `${progress}%` : "—"}</p><div className="mt-3 h-1.5 rounded bg-slate-100"><div className="h-full rounded bg-blue-600" style={{ width: `${progress}%` }}/></div><p className="mt-2 text-[11px] text-slate-400">Promedio de avance por actividad</p></article>
          <article className="border border-slate-200 border-t-[3px] border-t-blue-700 bg-white p-5 shadow-sm"><div className="flex items-center justify-between text-sm text-slate-600"><span>Actividades completas</span><span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">{tasks.length ? `${Math.round(completed / tasks.length * 100)}%` : "0%"}</span></div><p className="mt-4 text-2xl font-bold text-[#102f53]">{completed}<span className="ml-1 text-sm font-normal text-slate-400">/ {tasks.length}</span></p><p className="mt-4 text-[11px] text-slate-400">{tasks.filter((t) => t.status === "IN_PROGRESS").length} en curso · {tasks.filter((t) => t.status === "BLOCKED").length} bloqueadas</p></article>
          <article className="border border-slate-200 border-t-[3px] border-t-blue-700 bg-white p-5 shadow-sm"><div className="flex items-center justify-between text-sm text-slate-600"><span>Costo planificado</span><span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">COP</span></div><p className="mt-4 text-xl font-bold text-[#102f53]">{money(planned)}</p><p className="mt-4 text-[11px] text-slate-400">Suma de los costos por actividad</p></article>
          <article className="border border-slate-200 border-t-[3px] border-t-blue-700 bg-white p-5 shadow-sm"><div className="flex items-center justify-between text-sm text-slate-600"><span>Costo real</span><span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">COP</span></div><p className="mt-4 text-xl font-bold text-[#102f53]">{tasks.some((t) => Number(t.actualCost) > 0) ? money(actual) : "Sin reporte"}</p><p className="mt-4 text-[11px] text-slate-400">Costo ejecutado registrado</p></article>
        </section>

        <section className="mb-5 flex flex-col gap-4 border border-blue-200 bg-blue-50/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-sm font-bold text-[#102f53]">Intercambio con Microsoft Project</h2><p className="mt-1 text-xs text-slate-500">Importa o exporta actividades, fechas, avance, costos y dependencias en XML.</p></div>
          <div className="flex shrink-0 gap-2">
            <input ref={xmlInputRef} type="file" accept=".xml,text/xml,application/xml" onChange={importXml} className="hidden" aria-label="Seleccionar archivo XML" />
            {canEdit && <button onClick={() => xmlInputRef.current?.click()} className="rounded-sm border border-slate-300 bg-white px-4 py-2.5 text-[10px] font-bold uppercase text-slate-700 hover:border-blue-400 hover:text-blue-700">Importar XML</button>}
            <button onClick={exportXml} disabled={!tasks.length} className="rounded-sm border border-slate-300 bg-white px-4 py-2.5 text-[10px] font-bold uppercase text-slate-700 hover:border-blue-400 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50">Exportar XML</button>
          </div>
        </section>

        <section className="mb-5 flex flex-col gap-4 border border-blue-200 bg-blue-50/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-sm font-bold text-[#102f53]">Seguimiento colaborativo</h2><p className="mt-1 text-xs text-slate-500">{project.accessRole === "VIEWER" ? "Tienes acceso de solo lectura a este proyecto." : "Las actividades se guardan en línea para que el equipo consulte el avance."}</p></div><div className="flex items-center gap-2 text-xs font-semibold text-blue-700"><Users size={16}/>{project.accessRole === "OWNER" ? "Propietario" : project.accessRole === "ADMIN" ? "Administrador" : project.accessRole === "EDITOR" ? "Editor" : "Lector"}</div></section>

        <section className="mb-6 overflow-hidden border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold text-[#102f53]">Cronograma</h2><p className="mt-1 text-sm text-slate-500">Plan de trabajo y avance por actividad</p></div>{canEdit && <button onClick={newTask} className="inline-flex items-center justify-center gap-2 rounded-sm bg-blue-700 px-4 py-2.5 text-[11px] font-bold uppercase text-white hover:bg-blue-800"><Plus size={15}/> Agregar actividad</button>}</div>
          {!tasks.length ? <div className="px-6 py-14 text-center"><CalendarDays size={38} className="mx-auto mb-3 text-blue-300"/><p className="font-semibold text-[#102f53]">Aún no hay actividades</p><p className="mt-1 text-sm text-slate-500">Añade las actividades de la obra para construir su cronograma.</p>{canEdit && <button onClick={newTask} className="mt-4 rounded-sm bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white">Agregar primera actividad</button>}</div> : <div className="overflow-x-auto"><div className="min-w-[1050px]"><div className="grid border-b border-slate-200 bg-slate-50" style={{ gridTemplateColumns: "300px minmax(750px, 1fr)" }}><div className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Actividad</div><div className="grid" style={{ gridTemplateColumns: `repeat(${timeline.months.length}, minmax(75px, 1fr))` }}>{timeline.months.map((month, index) => <div key={`${month}-${index}`} className="border-l border-slate-200 px-2 py-2"><span className="block text-[11px] font-semibold capitalize text-slate-700">{month}</span></div>)}</div></div>
            {tasks.map((task) => { const bar = getBar(task); return <div key={task.id} className="grid border-b border-slate-100 last:border-0" style={{ gridTemplateColumns: "300px minmax(750px, 1fr)" }}><button onClick={() => canEdit && editTask(task)} disabled={!canEdit} className="border-r border-slate-200 px-4 py-3 text-left disabled:cursor-default"><span className="block truncate text-xs font-semibold text-[#102f53]">{task.name}</span><span className="mt-1 block text-[10px] text-slate-400">{dateText(task.startDate)} — {dateText(task.endDate)}</span></button><div className="relative min-h-[58px]" style={{ backgroundImage: `repeating-linear-gradient(to right, transparent 0, transparent calc(${100 / timeline.months.length}% - 1px), #e2e8f0 calc(${100 / timeline.months.length}% - 1px), #e2e8f0 ${100 / timeline.months.length}%)` }}>{bar && <button onClick={() => canEdit && editTask(task)} disabled={!canEdit} title={`${task.name}: ${task.progress}%`} className={`absolute top-1/2 h-5 -translate-y-1/2 overflow-hidden rounded-sm ${barColor[task.status] || "bg-blue-600"}`} style={bar}><span className="absolute inset-y-0 left-0 bg-white/25" style={{ width: `${task.progress}%` }}/><span className="relative block truncate px-2 text-left text-[9px] font-bold text-white">{task.name}</span></button>}</div></div>; })}</div></div>}
        </section>

        {!!tasks.length && <section className="overflow-hidden border border-slate-200 bg-white shadow-sm"><div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4"><ListTodo size={18} className="text-blue-700"/><div><h2 className="font-bold text-[#102f53]">Actividades y costos</h2><p className="mt-0.5 text-xs text-slate-500">Selecciona una actividad para actualizar su seguimiento.</p></div></div><div className="overflow-x-auto"><table className="w-full min-w-[950px] border-collapse text-left text-xs"><thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">Actividad</th><th className="px-3 py-3">Responsable</th><th className="px-3 py-3">Fechas</th><th className="px-3 py-3">Avance</th><th className="px-3 py-3">Estado</th><th className="px-3 py-3">Planificado</th><th className="px-3 py-3">Real</th>{canEdit && <th className="px-3 py-3">Acciones</th>}</tr></thead><tbody>{tasks.map((task) => <tr key={task.id} className="border-t border-slate-100 hover:bg-slate-50/70"><td className="max-w-[260px] px-4 py-3"><span className="block truncate font-semibold text-[#102f53]">{task.name}</span><span className="mt-1 block text-[10px] text-slate-400">Prioridad {priorities[task.priority] || "Normal"}</span></td><td className="px-3 py-3 text-slate-600">{task.assignedTo || "Sin asignar"}</td><td className="whitespace-nowrap px-3 py-3 text-slate-500">{dateText(task.startDate)}<br/>{dateText(task.endDate)}</td><td className="px-3 py-3"><div className="flex items-center gap-2"><div className="h-1.5 w-16 rounded bg-slate-100"><div className="h-full rounded bg-blue-600" style={{ width: `${task.progress}%` }}/></div>{task.progress}%</div></td><td className="px-3 py-3"><span className={`rounded px-2 py-1 text-[10px] font-semibold ${task.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700" : task.status === "BLOCKED" ? "bg-red-50 text-red-700" : task.status === "IN_PROGRESS" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"}`}>{states[task.status] || task.status}</span></td><td className="whitespace-nowrap px-3 py-3 text-slate-600">{money(task.plannedCost)}</td><td className="whitespace-nowrap px-3 py-3 text-slate-600">{money(task.actualCost)}</td>{canEdit && <td className="px-3 py-3"><div className="flex gap-1"><button onClick={() => editTask(task)} title="Editar actividad" className="rounded p-1.5 text-blue-700 hover:bg-blue-50"><Edit3 size={15}/></button><button onClick={() => removeTask(task)} title="Eliminar actividad" className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={15}/></button></div></td>}</tr>)}</tbody></table></div></section>}
      </div>

      {taskModal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3" onMouseDown={(e) => e.target === e.currentTarget && setTaskModal(false)}><section className="max-h-[96vh] w-full max-w-3xl overflow-y-auto rounded-md bg-white shadow-xl"><div className="flex items-center justify-between border-b border-slate-200 px-6 py-4"><div><h2 className="font-bold text-[#102f53]">{editing ? "Actualizar actividad" : "Agregar actividad"}</h2><p className="mt-1 text-xs text-slate-500">Registra el plan y el avance real de la obra.</p></div><button onClick={() => setTaskModal(false)} aria-label="Cerrar" className="rounded p-2 text-slate-400 hover:bg-slate-100"><X size={18}/></button></div><form onSubmit={saveTask} className="grid gap-4 p-6 sm:grid-cols-2">
        <label className="text-xs font-semibold text-slate-600 sm:col-span-2">Nombre de la actividad<input name="name" value={taskForm.name} onChange={changeTask} required maxLength={180} className={input} placeholder="Ej. Excavación de cimentación"/></label>
        <label className="text-xs font-semibold text-slate-600 sm:col-span-2">Descripción<textarea name="description" value={taskForm.description || ""} onChange={changeTask} rows={2} className={input} placeholder="Detalle de la actividad"/></label>
        <label className="text-xs font-semibold text-slate-600">Responsable<input name="assignedTo" value={taskForm.assignedTo || ""} onChange={changeTask} className={input} placeholder="Nombre del responsable"/></label>
        <label className="text-xs font-semibold text-slate-600">Prioridad<select name="priority" value={taskForm.priority} onChange={changeTask} className={input}>{Object.entries(priorities).map(([v, label]) => <option key={v} value={v}>{label}</option>)}</select></label>
        <label className="text-xs font-semibold text-slate-600">Inicio planificado<input name="startDate" type="date" value={taskForm.startDate} onChange={changeTask} className={input}/></label>
        <label className="text-xs font-semibold text-slate-600">Fin planificado<input name="endDate" type="date" value={taskForm.endDate} onChange={changeTask} className={input}/></label>
        <label className="text-xs font-semibold text-slate-600">Estado<select name="status" value={taskForm.status} onChange={changeTask} className={input}>{Object.entries(states).map(([v, label]) => <option key={v} value={v}>{label}</option>)}</select></label>
        <label className="text-xs font-semibold text-slate-600">Avance: {taskForm.progress}%<input name="progress" type="range" min="0" max="100" step="5" value={taskForm.progress} onChange={changeTask} className="mt-4 w-full accent-blue-700"/></label>
        <label className="text-xs font-semibold text-slate-600">Costo planificado (COP)<input name="plannedCost" type="number" min="0" step="0.01" value={taskForm.plannedCost} onChange={changeTask} className={input}/></label>
        <label className="text-xs font-semibold text-slate-600">Costo real (COP)<input name="actualCost" type="number" min="0" step="0.01" value={taskForm.actualCost} onChange={changeTask} className={input}/></label>
        <label className="text-xs font-semibold text-slate-600 sm:col-span-2">Actividades predecesoras<select multiple value={(taskForm.predecessorIds || []).map(String)} onChange={(e) => setTaskForm((current) => ({ ...current, predecessorIds: Array.from(e.target.selectedOptions, (option) => Number(option.value)) }))} className={`${input} h-24`}>{tasks.filter((task) => task.id !== editing?.id).map((task) => <option key={task.id} value={task.id}>{task.id}. {task.name}</option>)}</select><span className="mt-1 block font-normal text-slate-400">Puedes seleccionar las actividades que deben terminar antes de esta.</span></label>
        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 sm:col-span-2"><button type="button" onClick={() => setTaskModal(false)} className="rounded border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600">Cancelar</button><button disabled={saving} className="inline-flex items-center gap-2 rounded bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"><Save size={15}/>{saving ? "Guardando..." : "Guardar actividad"}</button></div>
      </form></section></div>}

      {projectModal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"><section className="w-full max-w-xl rounded-md bg-white shadow-xl"><div className="flex items-center justify-between border-b border-slate-200 px-6 py-4"><h2 className="font-bold text-[#102f53]">Editar proyecto</h2><button onClick={() => setProjectModal(false)} aria-label="Cerrar" className="rounded p-2 text-slate-400 hover:bg-slate-100"><X size={18}/></button></div><form onSubmit={saveProject} className="grid gap-4 p-6 sm:grid-cols-2"><label className="text-xs font-semibold text-slate-600 sm:col-span-2">Nombre<input name="name" value={projectForm.name} onChange={(e) => setProjectForm({ ...projectForm, [e.target.name]: e.target.value })} required className={input}/></label><label className="text-xs font-semibold text-slate-600 sm:col-span-2">Descripción<textarea name="description" value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, [e.target.name]: e.target.value })} rows={2} className={input}/></label><label className="text-xs font-semibold text-slate-600 sm:col-span-2">Ubicación<input name="location" value={projectForm.location} onChange={(e) => setProjectForm({ ...projectForm, [e.target.name]: e.target.value })} className={input}/></label><label className="text-xs font-semibold text-slate-600">Inicio<input type="date" name="startDate" value={projectForm.startDate} onChange={(e) => setProjectForm({ ...projectForm, [e.target.name]: e.target.value })} className={input}/></label><label className="text-xs font-semibold text-slate-600">Fin<input type="date" name="endDate" value={projectForm.endDate} onChange={(e) => setProjectForm({ ...projectForm, [e.target.name]: e.target.value })} className={input}/></label><label className="text-xs font-semibold text-slate-600 sm:col-span-2">Presupuesto (COP)<input type="number" min="0" step="0.01" name="budget" value={projectForm.budget} onChange={(e) => setProjectForm({ ...projectForm, [e.target.name]: e.target.value })} className={input}/></label><div className="flex justify-end gap-3 border-t border-slate-100 pt-4 sm:col-span-2"><button type="button" onClick={() => setProjectModal(false)} className="rounded border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600">Cancelar</button><button className="rounded bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white">Guardar cambios</button></div></form></section></div>}

      {shareModal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={(e) => e.target === e.currentTarget && setShareModal(false)}><section className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-md bg-white shadow-xl"><div className="flex items-center justify-between border-b border-slate-200 px-6 py-4"><div><h2 className="font-bold text-[#102f53]">Compartir proyecto</h2><p className="mt-1 text-xs text-slate-500">Da acceso a una persona con cuenta en el sistema.</p></div><button onClick={() => setShareModal(false)} aria-label="Cerrar" className="rounded p-2 text-slate-400 hover:bg-slate-100"><X size={18}/></button></div><div className="space-y-5 p-6"><form onSubmit={addMember} className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-semibold text-slate-600 sm:col-span-2">Correo electrónico<input type="email" required value={memberForm.email} onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })} className={input} placeholder="director@empresa.com"/></label><label className="text-xs font-semibold text-slate-600">Permiso<select value={memberForm.role} onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })} className={input}><option value="VIEWER">Solo lectura</option><option value="EDITOR">Puede editar</option></select></label><button className="self-end rounded bg-blue-700 px-4 py-2.5 text-xs font-bold uppercase text-white hover:bg-blue-800">Compartir acceso</button></form>{shareError && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{shareError}</p>}<div><h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Personas con acceso</h3><div className="divide-y divide-slate-100 rounded border border-slate-200">{owner && <div className="flex items-center justify-between gap-3 px-3 py-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-[#102f53]">{owner.name}</p><p className="truncate text-xs text-slate-500">{owner.email}</p></div><span className="rounded bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700">Propietario</span></div>}{members.map((member) => <div key={member.id} className="flex items-center justify-between gap-3 px-3 py-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-[#102f53]">{member.user.name}</p><p className="truncate text-xs text-slate-500">{member.user.email}</p></div><div className="flex shrink-0 items-center gap-2"><span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">{member.role === "EDITOR" ? "Editor" : "Solo lectura"}</span><button type="button" onClick={() => removeMember(member.userId)} title="Retirar acceso" className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={15}/></button></div></div>)}{!members.length && <p className="px-3 py-5 text-center text-xs text-slate-400">Todavía no has compartido este proyecto.</p>}</div></div></div></section></div>}
    </div>
  );
}

export default ProjectDashboardPage;
