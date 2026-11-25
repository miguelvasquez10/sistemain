import { useEffect, useState } from "react";
import { HardHat, PlusCircle, Layers, FolderKanban } from "lucide-react";
import { useParams } from "react-router-dom";
import InterventoriaModal from "../components/modals/InterventoriaModal";
import axiosClient from "../api/axiosClient";

function ProjectServicesPage() {

  const { projectId } = useParams();

  const [catalogServices, setCatalogServices] = useState([]);
  const [projectServices, setProjectServices] = useState([]);
  const [project, setProject] = useState(null);
  const [search, setSearch] = useState("");
  const [openInterventoria, setOpenInterventoria] = useState(false);
const [selectedProjectService, setSelectedProjectService] = useState(null);

  const canEdit = ["OWNER", "ADMIN", "EDITOR"].includes(project?.accessRole);

  //////////////////////////////////////////////////////
// Obtener proyecto
//////////////////////////////////////////////////////

const fetchProject = async () => {

  try {

    const res = await axiosClient.get(`/projects/${projectId}`);

    setProject(res.data);

  } catch (error) {

    console.error(error);

  }

};

  //////////////////////////////////////////////////////
  // Obtener catálogo de servicios
  //////////////////////////////////////////////////////

  const fetchCatalog = async () => {

    try {

      const res = await axiosClient.get("/services");

      setCatalogServices(res.data);

    } catch (error) {

      console.error(error);

    }

  };

  //////////////////////////////////////////////////////
  // Obtener servicios del proyecto
  //////////////////////////////////////////////////////

  const fetchProjectServices = async () => {

    try {

      const res = await axiosClient.get(`/projects/${projectId}/services`);

      setProjectServices(res.data);

    } catch (error) {

      console.error(error);

    }

  };

  //////////////////////////////////////////////////////
  // Agregar servicio al proyecto
  //////////////////////////////////////////////////////

  const addService = async (serviceId) => {

    try {

      await axiosClient.post(`/projects/${projectId}/services`, { serviceId });

      fetchProjectServices();

    } catch (error) {

      console.error(error);

    }

  };

  //////////////////////////////////////////////////////
  // useEffect
  //////////////////////////////////////////////////////

  useEffect(() => {

    fetchCatalog();
    fetchProjectServices();
    fetchProject();

  }, []);

  //////////////////////////////////////////////////////
  // verificar si servicio ya existe
  //////////////////////////////////////////////////////

  const isServiceActive = (serviceId) => {

    return projectServices.some(
      (ps) => ps.serviceId === serviceId
    );

  };

  const filteredServices = catalogServices.filter((service) =>
  service.name.toLowerCase().includes(search.toLowerCase())
);

  //////////////////////////////////////////////////////
  // render
  //////////////////////////////////////////////////////

  return (


<main className="min-h-screen bg-slate-100 px-4 py-8 md:px-8">

  <div className="mx-auto max-w-[1500px]">

    <div className="grid lg:grid-cols-3 gap-10">

      {/* ================================= */}
      {/* SIDEBAR PROYECTO */}
      {/* ================================= */}

      <div className="lg:col-span-1">

        <div className="sticky top-10">

          <div className="relative">

            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-20 blur-xl rounded-2xl"></div>

            <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8">

              <div className="text-sm text-slate-400 mb-3">
                Proyectos /
                <span className="text-blue-600 font-medium ml-1">
                  {project?.name}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-6">

                <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">

                  <FolderKanban className="w-7 h-7 text-blue-600"/>

                </div>

                <div>

                  <h1 className="text-xl font-bold text-slate-800">
                    {project?.name}
                  </h1>

                  <p className="text-slate-500 text-sm">
                    {project?.description || "Proyecto de ingeniería"}
                  </p>

                </div>

              </div>

              <div className="bg-blue-50 px-6 py-4 rounded-xl">

                <p className="text-xs text-slate-500">
                  Servicios activos
                </p>

                <p className="text-xl font-semibold text-blue-700">
                  {projectServices.length}
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ================================= */}
      {/* CATALOGO SERVICIOS */}
      {/* ================================= */}

    <div className="lg:col-span-2">

  {/* HEADER */}
  <div className="flex items-center justify-between mb-6">

    <h2 className="text-[#102f53] text-xl flex items-center gap-3">
      <HardHat className="w-6 h-6 text-blue-300"/>
      Servicios disponibles
    </h2>

    <div className="text-slate-500 text-sm">
      {filteredServices.length} servicios
    </div>

  </div>

  {/* BUSCADOR */}
  <div className="relative mb-6">

    <input
      type="text"
      placeholder="Buscar servicio..."
      value={search}
      onChange={(e)=>setSearch(e.target.value)}
      className="w-full bg-white/90 backdrop-blur border border-white/20 rounded-xl px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />

    <svg
      className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
    </svg>

  </div>

  {/* LISTA SERVICIOS */}
  <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl overflow-hidden">

    <div className="max-h-[550px] overflow-y-auto">

      {filteredServices.map((service) => {

        const active = isServiceActive(service.id);

        return (

          <div
            key={service.id}
            className="flex items-center justify-between px-6 py-4 border-b border-slate-100 hover:bg-slate-50 transition"
          >

            <div className="flex items-center gap-4">

              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">

                <HardHat className="w-5 h-5 text-blue-600"/>

              </div>

              <div>

                <h3 className="font-semibold text-slate-800">
                  {service.name}
                </h3>

                <p className="text-xs text-slate-500">
                  {service.description || "Servicio del sistema"}
                </p>

              </div>

            </div>

            {active ? (

              <span className="text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                Agregado
              </span>

            ) : canEdit ? (

              <button
                onClick={() => addService(service.id)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm"
              >
                <PlusCircle size={16}/>
                Agregar
              </button>

            ) : (
              <span className="text-xs text-slate-500">Solo lectura</span>
            )}

          </div>

        );

      })}

    </div>

  </div>

</div>

    </div>

    {/* ================================= */}
    {/* SERVICIOS ACTIVOS */}
    {/* ================================= */}

    <div className="mt-16">

      <h2 className="text-[#102f53] text-xl mb-8 flex items-center gap-3">

        <Layers className="w-6 h-6 text-blue-300"/>

        Servicios activos

      </h2>

     <div className="grid md:grid-cols-3 gap-8">

  {projectServices.map((ps) => (

    <div
      key={ps.id}
      className="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-6"
    >

      <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">

        <Layers className="w-6 h-6 text-blue-600"/>

      </div>

      <h3 className="text-lg font-semibold text-slate-800 mb-4">
        {ps.service.name}
      </h3>

      {canEdit && ps.service.name === "Interventoria" && (

        <button
          onClick={() => {
            setSelectedProjectService(ps);
            setOpenInterventoria(true);
          }}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Administrar
        </button>

      )}

    </div>

  ))}

</div>
{openInterventoria && (

  <InterventoriaModal
    projectService={selectedProjectService}
    onClose={() => setOpenInterventoria(false)}
  />

)}

    </div>

  </div>

</main>

  );
}

export default ProjectServicesPage;
