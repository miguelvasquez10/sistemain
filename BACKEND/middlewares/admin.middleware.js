module.exports = (req, res, next) => {

  try {

    // req.user debe venir del middleware de autenticación
    if (!req.user) {
      return res.status(401).json({
        message: "No autenticado"
      });
    }

    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Acceso solo para administradores"
      });
    }

    next();

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Error verificando permisos"
    });

  }

};
