const prisma = require('../prisma/prisma');
const fs = require('fs');

/**
 * Subir foto a una respuesta
 */
exports.uploadPhoto = async (req, res) => {

  try {

    const { responseId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        message: "No se subió ninguna imagen"
      });
    }

    const photo = await prisma.formPhoto.create({
      data: {
        url: `/uploads/${req.file.filename}`,
        responseId: Number(responseId)
      }
    });

    res.status(201).json(photo);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Error subiendo foto"
    });

  }

};


/**
 * Obtener fotos de una respuesta
 */
exports.getPhotosByResponse = async (req, res) => {

  try {

    const { responseId } = req.params;

    const photos = await prisma.formPhoto.findMany({
      where: {
        responseId: Number(responseId)
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    res.json(photos);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Error obteniendo fotos"
    });

  }

};


/**
 * Eliminar foto
 */
exports.deletePhoto = async (req, res) => {

  try {

    const { id } = req.params;

    const photo = await prisma.formPhoto.findUnique({
      where: {
        id: Number(id)
      }
    });

    if (!photo) {
      return res.status(404).json({
        message: "Foto no encontrada"
      });
    }

    // eliminar archivo físico
    const filePath = `.${photo.url}`;

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.formPhoto.delete({
      where: {
        id: Number(id)
      }
    });

    res.json({
      message: "Foto eliminada correctamente"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Error eliminando foto"
    });

  }

};
