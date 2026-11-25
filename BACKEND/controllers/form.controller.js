const prisma = require('../prisma/prisma');

/**
 * Crear formulario (ADMIN)
 */
exports.createForm = async (req, res) => {

  try {

    const { serviceId } = req.params;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "El nombre del formulario es obligatorio"
      });
    }

    const form = await prisma.form.create({
      data: {
        name,
        description,
        serviceId: Number(serviceId)
      }
    });

    res.status(201).json(form);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Error creando formulario"
    });

  }

};


/**
 * Obtener formularios de un servicio
 */
exports.getFormsByService = async (req, res) => {

  try {

    const { serviceId } = req.params;

    const forms = await prisma.form.findMany({
      where: {
        serviceId: Number(serviceId)
      },
      include: {
        fields: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    res.json(forms);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Error obteniendo formularios"
    });

  }

};


/**
 * Obtener formulario con campos
 */
exports.getFormById = async (req, res) => {

  try {

    const { id } = req.params;

    const form = await prisma.form.findUnique({
      where: {
        id: Number(id)
      },
      include: {
        fields: true
      }
    });

    if (!form) {
      return res.status(404).json({
        message: "Formulario no encontrado"
      });
    }

    res.json(form);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Error obteniendo formulario"
    });

  }

};


/**
 * Eliminar formulario
 */
exports.deleteForm = async (req, res) => {

  try {

    const { id } = req.params;

    await prisma.form.delete({
      where: {
        id: Number(id)
      }
    });

    res.json({
      message: "Formulario eliminado correctamente"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Error eliminando formulario"
    });

  }

};
