const prisma = require('../prisma/prisma');
const { buildResponsePdf } = require('../services/pdf.service');

/**
 * Generar PDF A4 dinámico de una respuesta de formulario
 */
exports.generateResponsePdf = async (req, res) => {

  try {

    const { responseId } = req.params;

    const response = await prisma.formResponse.findUnique({

      where: {
        id: Number(responseId),
      },

      include: {

        photos: true,

        form: {
          include: {
            fields: true
          }
        },

        projectService: {
          include: {
            project: true,
            service: true
          }
        }

      }

    });

    if (!response) {

      return res.status(404).json({
        message: 'Registro no encontrado',
      });

    }

    buildResponsePdf(res, {

      projectName: response.projectService?.project?.name,

      serviceName: response.projectService?.service?.name,

      formName: response.form?.name,

      formDescription: response.form?.description,

      responseId: response.id,

      createdAt: response.createdAt,

      fields: response.form?.fields || [],

      data: response.data || {},

      photos: response.photos || [],

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: 'Error generando PDF',
    });

  }

};