import { useEffect, useState } from "react";
import axios from "axios";
import FormResponseModal from "./FormResponseModal";
import {
  X,
  FileText,
  PlusCircle,
  ClipboardList,
  Loader
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

function InterventoriaModal({ projectService, onClose }) {

  const [forms, setForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState("");
  const [responses, setResponses] = useState([]);
  const [loadingForms, setLoadingForms] = useState(false);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [creating, setCreating] = useState(false);

  const token = localStorage.getItem("token");

  const [openResponseModal, setOpenResponseModal] = useState(false);
const [selectedResponse, setSelectedResponse] = useState(null);

const openResponse = (response) => {

  const form = forms.find(f => f.id === response.formId);

  setSelectedResponse({
    ...response,
    formName: form?.name
  });

  setOpenResponseModal(true);

};

  //////////////////////////////////////////////////////
  // Obtener formularios del servicio
  //////////////////////////////////////////////////////

  const fetchForms = async () => {

    try {

      setLoadingForms(true);

      const res = await axios.get(
        `${API_URL}/services/${projectService.serviceId}/forms`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setForms(res.data);

    } catch (error) {

      console.error(error);

    } finally {

      setLoadingForms(false);

    }

  };

  //////////////////////////////////////////////////////
  // Obtener respuestas del formulario
  //////////////////////////////////////////////////////

  const fetchResponses = async (formId) => {

    try {

      setLoadingResponses(true);

      const res = await axios.get(
        `${API_URL}/forms/${formId}/responses`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const filtered = res.data.filter(
        r => r.projectServiceId === projectService.id
      );

      setResponses(filtered);

    } catch (error) {

      console.error(error);

    } finally {

      setLoadingResponses(false);

    }

  };

  //////////////////////////////////////////////////////
  // Crear respuesta
  //////////////////////////////////////////////////////

  const createResponse = async () => {

    if (!selectedForm) return;

    try {

      setCreating(true);

      await axios.post(
        `${API_URL}/forms/${selectedForm}/responses`,
        {
          projectServiceId: projectService.id,
          data: {}
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      fetchResponses(selectedForm);

    } catch (error) {

      console.error(error);

    } finally {

      setCreating(false);

    }

  };

  //////////////////////////////////////////////////////
  // Effects
  //////////////////////////////////////////////////////

  useEffect(() => {

    fetchForms();

  }, []);

  useEffect(() => {

    if (selectedForm) {

      fetchResponses(selectedForm);

    }

  }, [selectedForm]);

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////

  return (

<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md">

  <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden">

    {/* HEADER */}

    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-6 flex items-center justify-between">

      <div className="flex items-center gap-3">

        <ClipboardList/>

        <div>

          <h2 className="text-xl font-semibold">
            Interventoría
          </h2>

          <p className="text-blue-100 text-sm">
            Formularios del servicio
          </p>

        </div>

      </div>

      <button
        onClick={onClose}
        className="hover:bg-white/20 p-2 rounded-lg transition"
      >
        <X/>
      </button>

    </div>

    <div className="p-8 space-y-10">

      {/* CREAR FORMULARIO */}

      <div className="bg-blue-50 rounded-2xl p-6">

        <h3 className="flex items-center gap-2 font-semibold text-slate-700 mb-4">

          <PlusCircle size={18}/>

          Nuevo registro

        </h3>

        {loadingForms ? (

          <div className="flex items-center gap-2 text-slate-500">
            <Loader className="animate-spin"/>
            Cargando formularios...
          </div>

        ) : (

          <div className="flex gap-4">

            <select
              value={selectedForm}
              onChange={(e)=>setSelectedForm(e.target.value)}
              className="flex-1 border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >

              <option value="">
                Selecciona un formulario
              </option>

              {forms.map((form) => (

                <option key={form.id} value={form.id}>
                  {form.name}
                </option>

              ))}

            </select>

            <button
              onClick={createResponse}
              disabled={creating}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl"
            >

              {creating ? <Loader className="animate-spin"/> : <PlusCircle size={18}/>}

              Crear

            </button>

          </div>

        )}

      </div>

      {/* HISTORIAL */}

      <div>

        <h3 className="flex items-center gap-2 font-semibold text-slate-700 mb-6">

          <FileText size={18}/>

          Formularios diligenciados

        </h3>

        {loadingResponses && (

          <div className="text-slate-400">
            Cargando registros...
          </div>

        )}

        {!loadingResponses && responses.length === 0 && (

          <div className="text-center py-10 text-slate-400">
            No hay registros aún
          </div>

        )}

        <div className="grid md:grid-cols-2 gap-4">

       {responses.map((response) => {

  const form = forms.find(f => f.id === response.formId);

  return (

    <div
      key={response.id}
      className="border rounded-xl p-4 hover:shadow-md transition flex items-center justify-between"
    >

      <div>

        <p className="font-medium text-slate-700">
          {form?.name || "Formulario"}
        </p>

        <p className="text-xs text-slate-500">
          {new Date(response.createdAt).toLocaleDateString()}
        </p>

      </div>

      <button
        onClick={() => openResponse(response)}
        className="text-blue-600 text-sm font-medium"
      >
        Ver
      </button>

    </div>

  );

})}
        </div>
        {openResponseModal && (

  <FormResponseModal
    response={selectedResponse}
    onClose={(updated) => {

  setOpenResponseModal(false);

  if (updated && selectedForm) {
    fetchResponses(selectedForm);
  }

}}
  />

)}

      </div>

    </div>

  </div>

</div>

  );

}

export default InterventoriaModal;