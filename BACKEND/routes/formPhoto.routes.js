const express = require('express');
const router = express.Router();

const formPhotoController = require('../controllers/formPhoto.controller');
const upload = require('../middlewares/upload');

/**
 * Subir foto
 */
router.post(
  '/responses/:responseId/photos',
  upload.single('photo'),
  formPhotoController.uploadPhoto
);

/**
 * Obtener fotos de un registro
 */
router.get(
  '/responses/:responseId/photos',
  formPhotoController.getPhotosByResponse
);

/**
 * Eliminar foto
 */
router.delete(
  '/photos/:id',
  formPhotoController.deletePhoto
);

module.exports = router;
