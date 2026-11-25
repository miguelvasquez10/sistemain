const prisma = require('../prisma/prisma');

/**
 * Crear servicio del sistema (ADMIN)
 */
exports.createServiceCatalog = async (req, res) => {

  try {

    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "El nombre del servicio es obligatorio"
      });
    }

    const service = await prisma.serviceCatalog.create({
      data: {
        name,
        description
      }
    });

    res.status(201).json(service);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Error creando servicio"
    });

  }

};


/**
 * Obtener catálogo de servicios
 */
exports.getServicesCatalog = async (req, res) => {

  try {

    const services = await prisma.serviceCatalog.findMany({
      orderBy: {
        createdAt: "asc"
      }
    });

    res.json(services);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Error obteniendo servicios"
    });

  }

};


/**
 * Obtener servicio con formularios
 */
exports.getServiceCatalogById = async (req, res) => {

  try {

    const { id } = req.params;

    const service = await prisma.serviceCatalog.findUnique({
      where: {
        id: Number(id)
      },
      include: {
        forms: {
          include: {
            fields: true
          }
        }
      }
    });

    if (!service) {
      return res.status(404).json({
        message: "Servicio no encontrado"
      });
    }

    res.json(service);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Error obteniendo servicio"
    });

  }

};


/**
 * Eliminar servicio del catálogo (ADMIN)
 */
exports.deleteServiceCatalog = async (req, res) => {

  try {

    const { id } = req.params;

    await prisma.serviceCatalog.delete({
      where: {
        id: Number(id)
      }
    });

    res.json({
      message: "Servicio eliminado correctamente"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Error eliminando servicio"
    });

  }

};
