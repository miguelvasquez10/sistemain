function Footer() {

  const year = new Date().getFullYear();

  return (

<footer className="bg-white border-t border-slate-200">

  <div className="max-w-7xl mx-auto px-6 py-6 text-center">

    <p className="text-slate-500 text-sm">

      © {year} Sistema V Ingeniería — Todos los derechos reservados

    </p>

  </div>

</footer>

  );
}

export default Footer;