const prisma = require('../prisma/prisma');
const { getProjectAccess, canEditProject } = require('../utils/projectAccess');

exports.addServiceToProject = async (req, res) => {
  try {
    const projectId = Number(req.params.projectId);
    const access = await getProjectAccess(projectId, req.user);
    if (!access.project) return res.status(404).json({ message: 'Proyecto no encontrado' });
    if (!canEditProject(access.role)) return res.status(403).json({ message: 'No tienes permiso para modificar este proyecto' });

    const serviceId = Number(req.body.serviceId);
    if (!Number.isInteger(serviceId) || serviceId < 1) {
      return res.status(400).json({ message: 'serviceId es obligatorio' });
    }

    const projectService = await prisma.projectService.create({
      data: { projectId, serviceId },
      include: { service: true }
    });
    res.status(201).json(projectService);
  } catch (error) {
    console.error('Error agregando servicio al proyecto:', error);
    res.status(500).json({ message: 'Error agregando servicio al proyecto' });
  }
};

exports.getProjectServices = async (req, res) => {
  try {
    const access = await getProjectAccess(req.params.projectId, req.user);
    if (!access.project) return res.status(404).json({ message: 'Proyecto no encontrado' });
    if (!access.role) return res.status(403).json({ message: 'No tienes acceso a este proyecto' });

    const services = await prisma.projectService.findMany({
      where: { projectId: Number(req.params.projectId) },
      include: { service: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(services);
  } catch (error) {
    console.error('Error obteniendo servicios del proyecto:', error);
    res.status(500).json({ message: 'Error obteniendo servicios del proyecto' });
  }
};

exports.removeServiceFromProject = async (req, res) => {
  try {
    const projectService = await prisma.projectService.findUnique({
      where: { id: Number(req.params.id) },
      select: { projectId: true }
    });
    if (!projectService) return res.status(404).json({ message: 'Servicio no encontrado en el proyecto' });

    const access = await getProjectAccess(projectService.projectId, req.user);
    if (!access.project) return res.status(404).json({ message: 'Proyecto no encontrado' });
    if (!canEditProject(access.role)) return res.status(403).json({ message: 'No tienes permiso para modificar este proyecto' });

    await prisma.projectService.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Servicio eliminado del proyecto' });
  } catch (error) {
    console.error('Error eliminando servicio:', error);
    res.status(500).json({ message: 'Error eliminando servicio' });
  }
};
