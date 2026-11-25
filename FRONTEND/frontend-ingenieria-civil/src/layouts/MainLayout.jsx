import { useEffect, useState } from "react";
import { Outlet, useLocation, useParams } from "react-router-dom";
import Header from "../components/Header";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/Authcontext";

function MainLayout() {
  const [projects, setProjects] = useState([]);
  const location = useLocation();
  const { projectId } = useParams();
  const { user } = useAuth();

  const refreshProjects = async () => {
    try {
      const response = await axiosClient.get("/projects");
      setProjects(response.data);
    } catch (error) {
      console.error("No se pudieron cargar los proyectos", error);
    }
  };

  useEffect(() => {
    refreshProjects();
  }, []);

  const activeProject = projects.find((project) => String(project.id) === String(projectId));
  const pageTitle = activeProject?.name || (location.pathname.startsWith("/projects") ? "Portafolio" : "Espacio de trabajo");
  const dateLabel = new Intl.DateTimeFormat("es-CO", { weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(new Date());

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 md:flex">
      <Header projects={projects} />
      <div className="min-w-0 flex-1">
        <header className="hidden h-[78px] items-center justify-between border-b border-slate-200 bg-white px-7 md:flex lg:px-10">
          <div className="text-sm text-slate-500">
            <span>Espacio de trabajo</span><span className="mx-2 text-slate-300">/</span>
            <span className="font-semibold text-slate-800">{pageTitle}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="capitalize">{dateLabel}</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 font-bold text-blue-700">
              {(user?.name || "IG").split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()}
            </div>
          </div>
        </header>
        <main className="min-h-[calc(100vh-78px)]">
          <Outlet context={{ projects, refreshProjects }} />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
