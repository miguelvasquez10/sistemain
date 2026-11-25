import { HardHat, Building2, Boxes } from "lucide-react";

function Principal() {

  return (

<main className="flex-1 relative overflow-hidden min-h-screen">

  {/* FONDO */}
  <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800"></div>

  {/* LUCES DECORATIVAS */}
  <div className="absolute inset-0 opacity-20">

    <div className="absolute -top-40 -left-40 w-[420px] h-[420px] bg-blue-500 rounded-full blur-3xl"></div>

    <div className="absolute -bottom-40 -right-40 w-[420px] h-[420px] bg-indigo-500 rounded-full blur-3xl"></div>

  </div>

  {/* CONTENIDO */}
  <div className="relative max-w-6xl mx-auto px-6 py-20">

    {/* TITULO */}
    <div className="text-center mb-16">

      <h1 className="text-4xl font-bold text-white">
        Sistema V Ingeniería
      </h1>

      <p className="text-blue-200 mt-3 text-lg">
        Plataforma de gestión para proyectos de ingeniería civil
      </p>

    </div>

    {/* CARDS */}
    <div className="grid md:grid-cols-3 gap-10">

      {/* INTERVENTORIA */}
      <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-8 hover:shadow-2xl transition group cursor-pointer">

        <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mb-6">

          <HardHat className="w-7 h-7 text-blue-600 group-hover:scale-110 transition"/>

        </div>

        <h2 className="text-lg font-semibold text-slate-800 mb-2">
          Interventoría
        </h2>

        <p className="text-sm text-slate-500">
          Gestión y seguimiento de contratos, actividades y pagos de interventoría.
        </p>

      </div>

      {/* MODELACION */}
      <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-8 hover:shadow-2xl transition group cursor-pointer">

        <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mb-6">

          <Building2 className="w-7 h-7 text-blue-600 group-hover:scale-110 transition"/>

        </div>

        <h2 className="text-lg font-semibold text-slate-800 mb-2">
          Modelación
        </h2>

        <p className="text-sm text-slate-500">
          Herramientas para modelación y análisis de proyectos de ingeniería civil.
        </p>

      </div>

      {/* FUTURO MODULO */}
      <div className="bg-white/90 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition group cursor-pointer opacity-90">

        <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mb-6">

          <Boxes className="w-7 h-7 text-blue-600 group-hover:scale-110 transition"/>

        </div>

        <h2 className="text-lg font-semibold text-slate-800 mb-2">
          Próximamente
        </h2>

        <p className="text-sm text-slate-500">
          Nuevos módulos para ampliar las capacidades del sistema.
        </p>

      </div>

    </div>

  </div>

</main>

  );
}

export default Principal;