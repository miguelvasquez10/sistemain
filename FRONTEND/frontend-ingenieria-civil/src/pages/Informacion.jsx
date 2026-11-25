import { ShieldCheck, FileText, Scale, Database, AlertTriangle, Users } from "lucide-react";

function Informacion() {

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
        Información y Normas de Uso
      </h1>

      <p className="text-blue-200 mt-3 text-lg">
        Lineamientos técnicos, legales y de responsabilidad para el uso del Sistema V Ingeniería.
      </p>

    </div>

    {/* GRID */}
    <div className="grid md:grid-cols-2 gap-8">

      {/* RESPONSABILIDAD USUARIO */}
      <div className="bg-white rounded-2xl shadow-xl p-8">

        <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mb-6">
          <Users className="w-7 h-7 text-blue-600"/>
        </div>

        <h2 className="text-lg font-semibold text-slate-800 mb-3">
          Responsabilidad del Usuario
        </h2>

        <p className="text-sm text-slate-600 leading-relaxed">
          El usuario es responsable de la veracidad, integridad y actualización de la información ingresada en el sistema.
          Toda información técnica, contractual o financiera debe cumplir con las normativas vigentes de ingeniería civil
          y contratación pública o privada aplicable. El uso indebido del sistema, manipulación de datos o alteración
          intencional de información podrá generar responsabilidades administrativas, contractuales o legales.
        </p>

      </div>

      {/* USO ADECUADO */}
      <div className="bg-white rounded-2xl shadow-xl p-8">

        <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mb-6">
          <FileText className="w-7 h-7 text-blue-600"/>
        </div>

        <h2 className="text-lg font-semibold text-slate-800 mb-3">
          Uso Adecuado del Sistema
        </h2>

        <p className="text-sm text-slate-600 leading-relaxed">
          El sistema debe utilizarse exclusivamente para actividades relacionadas con la gestión técnica,
          administrativa y contractual de proyectos de ingeniería civil. No está permitido el uso del sistema
          para fines fraudulentos, manipulación indebida de información técnica o alteración de registros
          asociados a contratos, interventorías o modelos técnicos.
        </p>

      </div>

      {/* NORMAS TECNICAS */}
      <div className="bg-white rounded-2xl shadow-xl p-8">

        <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mb-6">
          <Scale className="w-7 h-7 text-blue-600"/>
        </div>

        <h2 className="text-lg font-semibold text-slate-800 mb-3">
          Cumplimiento de Normas Técnicas
        </h2>

        <p className="text-sm text-slate-600 leading-relaxed">
          La información gestionada mediante esta plataforma debe alinearse con las normas técnicas aplicables
          en ingeniería civil, incluyendo estándares nacionales e internacionales cuando corresponda.
          Entre ellas pueden incluirse normas de construcción, especificaciones técnicas, reglamentos
          estructurales, normas de calidad, gestión documental y control de interventoría aplicables
          en cada proyecto.
        </p>

      </div>

      {/* SEGURIDAD DATOS */}
      <div className="bg-white rounded-2xl shadow-xl p-8">

        <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mb-6">
          <Database className="w-7 h-7 text-blue-600"/>
        </div>

        <h2 className="text-lg font-semibold text-slate-800 mb-3">
          Protección de la Información
        </h2>

        <p className="text-sm text-slate-600 leading-relaxed">
          El sistema implementa mecanismos de seguridad para proteger la información almacenada.
          Sin embargo, cada usuario es responsable de proteger sus credenciales de acceso,
          evitar compartir contraseñas y garantizar el uso seguro de sus sesiones dentro de la plataforma.
        </p>

      </div>

      {/* PROPIEDAD INTELECTUAL */}
      <div className="bg-white rounded-2xl shadow-xl p-8">

        <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mb-6">
          <ShieldCheck className="w-7 h-7 text-blue-600"/>
        </div>

        <h2 className="text-lg font-semibold text-slate-800 mb-3">
          Propiedad Intelectual
        </h2>

        <p className="text-sm text-slate-600 leading-relaxed">
          El software, diseño, arquitectura tecnológica y funcionalidades del Sistema V Ingeniería
          están protegidos por derechos de propiedad intelectual. El uso del sistema no concede
          derechos de reproducción, modificación o distribución del software sin autorización previa.
        </p>

      </div>

      {/* LIMITACION RESPONSABILIDAD */}
      <div className="bg-white rounded-2xl shadow-xl p-8">

        <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mb-6">
          <AlertTriangle className="w-7 h-7 text-blue-600"/>
        </div>

        <h2 className="text-lg font-semibold text-slate-800 mb-3">
          Limitación de Responsabilidad
        </h2>

        <p className="text-sm text-slate-600 leading-relaxed">
          El sistema actúa como herramienta de gestión y apoyo técnico. Las decisiones técnicas,
          contractuales o administrativas derivadas de la información registrada en la plataforma
          son responsabilidad de los profesionales y entidades que utilizan el sistema.
        </p>

      </div>

    </div>

  </div>

</main>

  );
}

export default Informacion;