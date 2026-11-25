const prisma = require('../prisma/prisma');

/**
 * Crear campo para un formulario (ADMIN)
 */
exports.createField = async (req, res) => {

  try {

    const { formId } = req.params;

    const { label, type, required, order } = req.body;

    if (!label || !type) {
      return res.status(400).json({
        message: "label y type son obligatorios"
      });
    }

    const field = await prisma.formField.create({
      data: {
        label,
        type,
        required: required || false,
        order: order || 0,
        formId: Number(formId)
      }
    });

    res.status(201).json(field);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Error creando campo del formulario"
    });

  }

};


/**
 * Obtener campos de un formulario
 */
exports.getFieldsByForm = async (req, res) => {

  try {

    const { formId } = req.params;

    const fields = await prisma.formField.findMany({
      where: {
        formId: Number(formId)
      },
      orderBy: {
        order: "asc"
      }
    });

    res.json(fields);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Error obteniendo campos"
    });

  }

};


/**
 * Actualizar campo
 */
exports.updateField = async (req, res) => {

  try {

    const { id } = req.params;

    const { label, type, required, order } = req.body;

    const field = await prisma.formField.update({
      where: {
        id: Number(id)
      },
      data: {
        label,
        type,
        required,
        order
      }
    });

    res.json(field);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Error actualizando campo"
    });

  }

};


/**
 * Eliminar campo
 */
exports.deleteField = async (req, res) => {

  try {

    const { id } = req.params;

    await prisma.formField.delete({
      where: {
        id: Number(id)
      }
    });

    res.json({
      message: "Campo eliminado correctamente"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Error eliminando campo"
    });

  }

};
