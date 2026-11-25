import { useEffect, useState } from "react";
import axios from "axios";
import { X, Camera } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

function FormResponseModal({ response, onClose }) {

  const [fields, setFields] = useState([]);
  const [data, setData] = useState(response.data || {});
  const [photoModal, setPhotoModal] = useState(null);
  

  const token = localStorage.getItem("token");

  //////////////////////////////////////////////////////
  // obtener campos del formulario
  //////////////////////////////////////////////////////

  const fetchFields = async () => {

    try {

      const res = await axios.get(
        `${API_URL}/forms/${response.formId}/fields`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setFields(res.data);

    } catch (error) {

      console.error(error);

    }

  };

  //////////////////////////////////////////////////////
  // guardar respuestas
  //////////////////////////////////////////////////////

  const saveResponse = async () => {

    try {

      await axios.put(
        `${API_URL}/responses/${response.id}`,
        {
          data
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
  // cerrar modal
    onClose(true);
    } catch (error) {

      console.error(error);

    }

  };

  //////////////////////////////////////////////////////
  // subir foto
  //////////////////////////////////////////////////////

  const uploadPhoto = async (file) => {

    const formData = new FormData();
    formData.append("photo", file);

    try {

      await axios.post(
        `${API_URL}/responses/${response.id}/photos`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
        // refrescar campos para mostrar la foto subida
    } catch (error) {

      console.error(error);

    }

  };

  useEffect(() => {

    fetchFields();

  }, []);

  const downloadReport = async () => {

  try {

    const res = await axios.get(
      `${API_URL}/responses/${response.id}/pdf`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: "blob"
      }
    );

    const url = window.URL.createObjectURL(new Blob([res.data]));

    const link = document.createElement("a");

    link.href = url;

    link.setAttribute(
      "download",
      `${response.formName || "formulario"}_${response.id}.pdf`
    );

    document.body.appendChild(link);

    link.click();

    link.remove();

  } catch (error) {

    console.error(error);

  }

};

  //////////////////////////////////////////////////////
  // render campo dinámico
  //////////////////////////////////////////////////////

const renderField = (field) => {

  const value = data[field.id] || "";

  const baseInput =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white";

  switch (field.type) {

    //////////////////////////////////////////////////////
    // TEXT
    //////////////////////////////////////////////////////

    case "TEXT":
      return (
        <input
          type="text"
          value={value}
          onChange={(e)=>setData({
            ...data,
            [field.id]: e.target.value
          })}
          className={baseInput}
          placeholder="Escribe aquí..."
        />
      );

    //////////////////////////////////////////////////////
    // NUMBER
    //////////////////////////////////////////////////////

    case "NUMBER":
      return (
        <input
          type="number"
          value={value}
          onChange={(e)=>setData({
            ...data,
            [field.id]: e.target.value
          })}
          className={baseInput}
          placeholder="Ingresa un número"
        />
      );

    //////////////////////////////////////////////////////
    // DATE
    //////////////////////////////////////////////////////

    case "DATE":
      return (
        <input
          type="date"
          value={value}
          onChange={(e)=>setData({
            ...data,
            [field.id]: e.target.value
          })}
          className={baseInput}
        />
      );

    //////////////////////////////////////////////////////
    // BOOLEAN (checkbox moderno)
    //////////////////////////////////////////////////////

    case "BOOLEAN":
      return (

        <label className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-slate-100 transition">

          <input
            type="checkbox"
            checked={value}
            onChange={(e)=>setData({
              ...data,
              [field.id]: e.target.checked
            })}
            className="w-5 h-5 accent-blue-600"
          />

          <span className="text-sm text-slate-700">
            Marcar si cumple
          </span>

        </label>

      );

    //////////////////////////////////////////////////////
    // TEXTAREA
    //////////////////////////////////////////////////////

    case "TEXTAREA":
      return (
        <textarea
          rows={4}
          value={value}
          onChange={(e)=>setData({
            ...data,
            [field.id]: e.target.value
          })}
          className={baseInput + " resize-none"}
          placeholder="Escribe una descripción..."
        />
      );

    //////////////////////////////////////////////////////
    // PHOTO
    //////////////////////////////////////////////////////
case "PHOTO":

  const preview = data[`preview_${field.id}`];

  return (

    <div className="space-y-4">

      {!preview && (

        <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-slate-300 rounded-xl p-8 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">

          <Camera className="w-10 h-10 text-slate-400 mb-3"/>

          <span className="text-sm font-medium text-slate-600">
            Agregar registro fotográfico
          </span>

          <span className="text-xs text-slate-400 mt-1">
            PNG, JPG o JPEG
          </span>

          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            className="hidden"
            onChange={(e) => {

              const file = e.target.files[0];

              if (!file) return;

              const allowed = [
                "image/png",
                "image/jpeg",
                "image/jpg"
              ];

              if (!allowed.includes(file.type)) {

                alert("Solo se permiten imágenes PNG, JPG o JPEG");

                return;

              }

              const previewUrl = URL.createObjectURL(file);

              setData({
                ...data,
                [`preview_${field.id}`]: previewUrl
              });

              uploadPhoto(file);

            }}
          />

        </label>

      )}

      {/* REGISTRO FOTOGRAFICO */}

      {preview && (

        <div className="space-y-3">

          <div
            onClick={() => setPhotoModal(preview)}
            className="relative rounded-xl overflow-hidden border cursor-pointer group"
          >

            <img
              src={preview}
              alt="registro"
              className="w-full h-56 object-cover"
            />

            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">

              <span className="text-white text-sm font-medium">
                Ver fotografía
              </span>

            </div>

          </div>

          {/* BOTON CAMBIAR FOTO */}

          <label className="text-sm text-blue-600 cursor-pointer hover:underline">

            Cambiar fotografía

            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              className="hidden"
              onChange={(e) => {

                const file = e.target.files[0];

                if (!file) return;

                const previewUrl = URL.createObjectURL(file);

                setData({
                  ...data,
                  [`preview_${field.id}`]: previewUrl
                });

                uploadPhoto(file);

              }}
            />

          </label>

        </div>

      )}

    </div>

  );
    default:
      return null;

  }

};
  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////

  return (

<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur">

  <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">

    {/* HEADER */}

    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-6 flex items-center justify-between">

      <div>

        <h2 className="text-xl font-semibold">
          {response.formName || "Formulario"}
        </h2>

        <p className="text-blue-100 text-sm mt-1">
          {new Date(response.createdAt).toLocaleDateString()}
        </p>

      </div>

      <button
        onClick={onClose}
        className="p-2 rounded-lg hover:bg-white/20 transition"
      >
        <X size={20}/>
      </button>

    </div>


    {/* BODY */}

    <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6 bg-slate-50">

      {fields.map((field) => (

        <div
          key={field.id}
          className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition"
        >

          {/* LABEL */}

          <div className="flex items-center justify-between mb-3">

            <label className="text-sm font-semibold text-slate-700">

              {field.label}

            </label>

            {field.required && (

              <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded-md">
                Obligatorio
              </span>

            )}

          </div>

          {/* FIELD */}

          <div>

            {renderField(field)}

          </div>

        </div>

      ))}

    </div>


    {/* FOOTER */}

<div className="border-t border-slate-200 px-8 py-4 bg-white flex justify-between items-center">

  {/* BOTON DESCARGAR */}

  <button
    onClick={downloadReport}
    className="flex items-center gap-2 px-5 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
  >
    Descargar informe
  </button>

  <div className="flex gap-3">

    <button
      onClick={onClose}
      className="px-5 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 transition"
    >
      Cancelar
    </button>

    <button
      onClick={saveResponse}
      className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition"
    >
      Guardar formulario
    </button>

  </div>

</div>
  </div>
  {photoModal && (

  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80">

    <div className="relative">

      <img
        src={photoModal}
        className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl"
      />

      <button
        onClick={() => setPhotoModal(null)}
        className="absolute -top-10 right-0 text-white text-lg"
      >
        <X/>
      </button>

    </div>

  </div>

)}

</div>
  );

}

export default FormResponseModal;