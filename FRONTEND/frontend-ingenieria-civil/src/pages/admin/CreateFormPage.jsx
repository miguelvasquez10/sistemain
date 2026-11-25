import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import { GripVertical } from "lucide-react";
import {
Wrench,
FileText,
Layers,
Plus,
Search,
Edit3,
X,
Save
} from "lucide-react";

import {
Pencil,
Trash2,
Type,
Hash,
Calendar,
CheckSquare,
List,
AlignLeft,
Camera
} from "lucide-react";

import {
DndContext,
closestCenter
} from "@dnd-kit/core";

import {
SortableContext,
verticalListSortingStrategy,
arrayMove
} from "@dnd-kit/sortable";

import {
useSortable
} from "@dnd-kit/sortable";

import {CSS} from "@dnd-kit/utilities";

const getFieldIcon = (type) => {

switch(type){

case "TEXT":
return <Type size={16}/>

case "NUMBER":
return <Hash size={16}/>

case "DATE":
return <Calendar size={16}/>

case "BOOLEAN":
return <CheckSquare size={16}/>

case "SELECT":
return <List size={16}/>

case "TEXTAREA":
return <AlignLeft size={16}/>

case "PHOTO":
return <Camera size={16}/>

default:
return <Type size={16}/>

}

}


function SortableField({ field, startEditField, handleDeleteField }) {

const {
attributes,
listeners,
setNodeRef,
transform,
transition
} = useSortable({ id: field.id });

const style = {
transform: CSS.Transform.toString(transform),
transition
};

return (

<div
ref={setNodeRef}
style={style}
className="border border-slate-200 rounded-xl px-4 py-3 flex justify-between items-center bg-white hover:shadow-sm transition"
>

<div className="flex items-center gap-3">

{/* DRAG HANDLE */}

<div
{...attributes}
{...listeners}
className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 transition"
>

<GripVertical size={18}/>

</div>


{/* ICONO CAMPO */}

<div className="text-slate-500">

{getFieldIcon(field.type)}

</div>


{/* INFO CAMPO */}

<div>

<p className="font-semibold text-sm text-slate-700">
{field.label}
</p>

<span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
{field.type}
</span>

</div>

</div>


{/* BOTONES */}

<div className="flex items-center gap-2">

<button
onClick={(e)=>{
e.stopPropagation();
startEditField(field);
}}
className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
>

<Pencil size={14}/>

Editar

</button>


<button
onClick={(e)=>{
e.stopPropagation();
handleDeleteField(field.id);
}}
className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
>

<Trash2 size={14}/>

Eliminar

</button>

</div>

</div>
);

}

function CreateFormPage() {

  const [services, setServices] = useState([]);
  const [forms, setForms] = useState([]);

  const [selectedService, setSelectedService] = useState(null);
  const [selectedForm, setSelectedForm] = useState(null);

  const [search, setSearch] = useState("");

  const [serviceData, setServiceData] = useState({
    name: "",
    description: ""
  });

  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });

  const [fieldData, setFieldData] = useState({
    label: "",
    type: "TEXT"
  });

  const [modalOpen, setModalOpen] = useState(false);

  const [fields, setFields] = useState([]);

  const [editingField, setEditingField] = useState(null);

  //////////////////////////////////////////////////////
  // Fetch services
  //////////////////////////////////////////////////////

  const fetchServices = async () => {

    try {

      const res = await axiosClient.get("/services");

      setServices(res.data);

    } catch (err) {

      console.error("Error fetching services", err);

    }

  };

  //////////////////////////////////////////////////////
  // Fetch forms
  //////////////////////////////////////////////////////

  const fetchForms = async (serviceId) => {

    if (!serviceId) return;

    try {

      const res = await axiosClient.get(`/services/${serviceId}/forms`);

      setForms(res.data);

    } catch (err) {

      console.error("Error fetching forms", err);

    }

  };

  //////////////////////////////////////////////////////
  // Effects
  //////////////////////////////////////////////////////

  useEffect(() => {

    fetchServices();

  }, []);

  useEffect(() => {

    if (selectedService) {
      fetchForms(selectedService);
    }

  }, [selectedService]);

  //////////////////////////////////////////////////////
  // Create service
  //////////////////////////////////////////////////////

  const handleCreateService = async (e) => {

    e.preventDefault();

    try {

      await axiosClient.post("/services", serviceData);

      setServiceData({
        name: "",
        description: ""
      });

      fetchServices();

    } catch (err) {

      console.error("Error creating service", err);

    }

  };

  //////////////////////////////////////////////////////
  // Create form
  //////////////////////////////////////////////////////

  const handleCreateForm = async (e) => {

    e.preventDefault();

    try {

      await axiosClient.post(
        `/services/${selectedService}/forms`,
        formData
      );

      setFormData({
        name: "",
        description: ""
      });

      fetchForms(selectedService);

    } catch (err) {

      console.error("Error creating form", err);

    }

  };

  //////////////////////////////////////////////////////
  // Create field
  //////////////////////////////////////////////////////

const handleCreateField = async () => {

  try {

    await axiosClient.post(
      `/forms/${selectedForm.id}/fields`,
      fieldData
    );

    setFieldData({
      label: "",
      type: "TEXT"
    });

    fetchFields(selectedForm.id);

  } catch (err) {

    console.error("Error creating field", err);

  }

};

//////////////////////////////////////////////////////
// Update field
//////////////////////////////////////////////////////

const handleUpdateField = async () => {

  try {

    await axiosClient.put(
      `/fields/${editingField.id}`,
      fieldData
    );

    setFieldData({
      label: "",
      type: "TEXT"
    });

    setEditingField(null);

    fetchFields(selectedForm.id);

  } catch (err) {

    console.error("Error updating field", err);

  }

};

const startEditField = (field) => {

  setEditingField(field);

  setFieldData({
    label: field.label,
    type: field.type
  });

};

  //////////////////////////////////////////////////////
  // Filter forms
  //////////////////////////////////////////////////////

  const filteredForms = forms.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );


//////////////////////////////////////////////////////
// Fetch fields
//////////////////////////////////////////////////////

const fetchFields = async (formId) => {

  if (!formId) return;

  try {

    const res = await axiosClient.get(`/forms/${formId}/fields`);

    setFields(res.data);

  } catch (err) {

    console.error("Error fetching fields", err);

  }

};

useEffect(() => {

  if (selectedForm) {
    fetchFields(selectedForm.id);
  }

}, [selectedForm]);

//////////////////////////////////////////////////////
// Delete field
//////////////////////////////////////////////////////

const handleDeleteField = async (fieldId) => {

  if (!confirm("¿Eliminar este campo?")) return;

  try {

    await axiosClient.delete(`/fields/${fieldId}`);

    fetchFields(selectedForm.id);

  } catch (err) {

    console.error("Error deleting field", err);

  }

};

const handleDragEnd = async (event) => {

const {active, over} = event;

if (!over || active.id === over.id) return;

const oldIndex = fields.findIndex(f => f.id === active.id);
const newIndex = fields.findIndex(f => f.id === over.id);

const newFields = arrayMove(fields, oldIndex, newIndex);

setFields(newFields);

try {

await Promise.all(

newFields.map((field, index) =>

axiosClient.put(`/fields/${field.id}`, {
...field,
order: index
})

)

);

} catch (err) {

console.error("Error updating order", err);

}

};

  return (

<main className="flex-1 relative overflow-hidden min-h-screen">

<div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800"></div>

<div className="relative max-w-7xl mx-auto px-6 py-12">

<div className="flex items-center justify-center gap-3 mb-10 text-white">
<Layers size={28}/>
<h1 className="text-3xl font-bold">
Administración de Formularios
</h1>
</div>

<div className="grid grid-cols-2 gap-6">

{/* ====================== */}
{/* COLUMNA 1 - SERVICIOS */}
{/* ====================== */}

<div className="space-y-6">

<div className="bg-white rounded-2xl p-6 shadow-sm">

<h2 className="flex items-center gap-2 font-semibold text-slate-700 mb-4">
<Wrench size={18}/>
Crear Servicio
</h2>

<form onSubmit={handleCreateService} className="space-y-3">

<input
className="w-full border border-slate-300 px-3 py-2 rounded-lg"
placeholder="Nombre servicio"
value={serviceData.name}
onChange={(e)=>setServiceData({
...serviceData,
name:e.target.value
})}
/>

<textarea
className="w-full border border-slate-300 px-3 py-2 rounded-lg"
placeholder="Descripción"
value={serviceData.description}
onChange={(e)=>setServiceData({
...serviceData,
description:e.target.value
})}
/>

<button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full transition">
<Plus size={16}/>
Crear servicio
</button>

</form>

</div>


<div className="bg-white rounded-2xl p-6 shadow-sm">

<h2 className="flex items-center gap-2 font-semibold text-slate-700 mb-4">
<Layers size={18}/>
Mis Servicios
</h2>

<div className="space-y-2">

{services.map(service => (

<div
key={service.id}
onClick={()=>setSelectedService(service.id)}
className={`p-4 border rounded-xl cursor-pointer transition
${selectedService === service.id
? "bg-blue-50 border-blue-400 shadow-sm"
: "hover:bg-slate-50 hover:shadow-sm"
}
`}
>

<p className="font-semibold text-slate-700">
{service.name}
</p>

<p className="text-xs text-slate-500">
{service.description}
</p>

</div>

))}

</div>

</div>

</div>

{/* ====================== */}
{/* COLUMNA 2 - FORMULARIOS */}
{/* ====================== */}

<div className="space-y-6">

<div className="bg-white rounded-2xl p-6 shadow-sm">

<h2 className="flex items-center gap-2 font-semibold text-slate-700 mb-4">
<FileText size={18}/>
Crear formulario
</h2>

<form onSubmit={handleCreateForm} className="space-y-3">

<input
className="w-full border border-slate-300 px-3 py-2 rounded-lg"
placeholder="Nombre formulario"
value={formData.name}
onChange={(e)=>setFormData({
...formData,
name:e.target.value
})}
/>

<textarea
className="w-full border border-slate-300 px-3 py-2 rounded-lg"
placeholder="Descripción"
value={formData.description}
onChange={(e)=>setFormData({
...formData,
description:e.target.value
})}
/>

<button
disabled={!selectedService}
className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full disabled:opacity-40 transition"
>
<Plus size={16}/>
Crear formulario
</button>

</form>

</div>


<div className="bg-white rounded-2xl p-6 shadow-sm">

<h2 className="flex items-center gap-2 font-semibold text-slate-700 mb-4">
<FileText size={18}/>
Formularios
</h2>

<div className="relative mb-4">

<Search
size={16}
className="absolute left-3 top-3 text-slate-400"
/>

<input
placeholder="Buscar formulario..."
className="w-full border border-slate-300 pl-9 pr-3 py-2 rounded-lg"
value={search}
onChange={(e)=>setSearch(e.target.value)}
/>

</div>

<div className="space-y-3">

{filteredForms.map(form => (

<div
key={form.id}
className={`border border-slate-200 p-4 rounded-xl flex justify-between items-center cursor-pointer transition
${selectedForm?.id === form.id
? "bg-blue-50 border-blue-400 shadow-sm"
: "hover:bg-slate-50 hover:shadow-sm"
}
`}
onClick={()=>setSelectedForm(form)}
>

<div>

<p className="font-semibold text-slate-700">
{form.name}
</p>

<p className="text-sm text-slate-500">
{form.description}
</p>

</div>

<button
onClick={(e)=>{
e.stopPropagation()
setSelectedForm(form)
setModalOpen(true)
}}
className="flex items-center gap-1 text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition"
>

<Edit3 size={14}/>
Editar

</button>

</div>

))}

</div>

</div>

</div>

</div>

{/* ====================== */}
{/* MODAL CAMPOS */}
{/* ====================== */}

{modalOpen && (

<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur">

<div className="relative w-full max-w-xl max-h-[85vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">

{/* HEADER */}

<div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex items-center justify-between">

<div className="flex items-center gap-2">
<FileText size={18}/>
<h2 className="font-semibold">
Campos del formulario
</h2>
</div>

<button
onClick={()=>setModalOpen(false)}
className="p-2 rounded-lg hover:bg-white/20 transition"
>
<X size={18}/>
</button>

</div>


{/* BODY */}

<div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-slate-50">

{fields.length === 0 && (
<p className="text-sm text-slate-500">
Este formulario aún no tiene campos
</p>
)}

<DndContext
collisionDetection={closestCenter}
onDragEnd={handleDragEnd}
>

<SortableContext
items={fields.map(f => f.id)}
strategy={verticalListSortingStrategy}
>

<div className="space-y-2">

{fields.map(field => (

<SortableField
key={field.id}
field={field}
startEditField={startEditField}
handleDeleteField={handleDeleteField}
/>

))}

</div>

</SortableContext>

</DndContext>

</div>


{/* FOOTER */}

<div className="border-t border-slate-200 px-6 py-4 bg-white">

<h3 className="font-semibold mb-2 text-slate-700">
{editingField ? "Editar campo" : "Agregar nuevo campo"}
</h3>

<input
className="w-full border border-slate-300 px-3 py-2 rounded-lg mb-3"
placeholder="Nombre campo"
value={fieldData.label}
onChange={(e)=>setFieldData({
...fieldData,
label:e.target.value
})}
/>

<select
className="w-full border border-slate-300 px-3 py-2 rounded-lg mb-4"
value={fieldData.type}
onChange={(e)=>setFieldData({
...fieldData,
type:e.target.value
})}
>

<option value="TEXT">Texto</option>
<option value="NUMBER">Número</option>
<option value="DATE">Fecha</option>
<option value="BOOLEAN">Si / No</option>
<option value="SELECT">Select</option>
<option value="TEXTAREA">Textarea</option>
<option value="PHOTO">Foto</option>

</select>

<div className="flex justify-end gap-3">

<button
onClick={()=>setModalOpen(false)}
className="px-5 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 transition"
>
Cerrar
</button>

<button
onClick={editingField ? handleUpdateField : handleCreateField}
className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition"
>

<Save size={16}/>

{editingField ? "Actualizar campo" : "Agregar campo"}

</button>

</div>

</div>

</div>

</div>

)}

</div>

</main>
  );
}

export default CreateFormPage;