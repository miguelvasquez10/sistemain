const prisma = require('../prisma/prisma');

/**
 * Crear respuesta de formulario
 */
exports.createResponse = async (req, res) => {

  try {

    const { formId } = req.params;
    const { projectServiceId, data } = req.body;

    if (!projectServiceId) {
      return res.status(400).json({
        message: "projectServiceId es obligatorio"
      });
    }

    const response = await prisma.formResponse.create({
      data: {
        formId: Number(formId),
        projectServiceId: Number(projectServiceId),
        data
      }
    });

    res.status(201).json(response);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Error guardando respuesta"
    });

  }

};


/**
 * Obtener respuestas de un formulario
 */
exports.getResponsesByForm = async (req, res) => {

  try {

    const { formId } = req.params;

    const responses = await prisma.formResponse.findMany({
      where: {
        formId: Number(formId)
      },
      include: {
        photos: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    res.json(responses);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Error obteniendo respuestas"
    });

  }

};


/**
 * Obtener una respuesta específica
 */
exports.getResponseById = async (req, res) => {

  try {

    const { id } = req.params;

    const response = await prisma.formResponse.findUnique({
      where: {
        id: Number(id)
      },
      include: {
        photos: true
      }
    });

    if (!response) {
      return res.status(404).json({
        message: "Registro no encontrado"
      });
    }

    res.json(response);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Error obteniendo registro"
    });

  }

};


/**
 * Eliminar registro
 */
exports.deleteResponse = async (req, res) => {

  try {

    const { id } = req.params;

    await prisma.formResponse.delete({
      where: {
        id: Number(id)
      }
    });

    res.json({
      message: "Registro eliminado correctamente"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Error eliminando registro"
    });

  }

};

/**
 * Actualizar respuesta de formulario
 */
exports.updateResponse = async (req, res) => {

  try {

    const { id } = req.params;
    const { data } = req.body;

    const response = await prisma.formResponse.update({
      where: {
        id: Number(id)
      },
      data: {
        data
      }
    });

    res.json(response);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Error actualizando respuesta"
    });

  }

};