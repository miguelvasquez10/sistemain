const prisma = require('../prisma/prisma');
const { getProjectAccess, canManageProject } = require('../utils/projectAccess');

function parseDate(value) {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  const date = new Date(String(value).slice(0, 10) + 'T12:00:00.000Z');
  if (Number.isNaN(date.getTime())) throw new Error('Fecha inválida');
  return date;
}

function parseBudget(value) {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) throw new Error('El presupuesto debe ser un valor positivo');
  return amount.toFixed(2);
}

function accessRole(project, user, membershipRole) {
  if (user.role === 'ADMIN') return 'ADMIN';
  if (project.userId === Number(user.id)) return 'OWNER';
  return membershipRole || 'VIEWER';
}

exports.createProject = async (req, res) => {
  const name = String(req.body.name || '').trim();
  if (!name) return res.status(400).json({ message: 'El nombre del proyecto es obligatorio' });

  try {
    const startDate = parseDate(req.body.startDate);
    const endDate = parseDate(req.body.endDate);
    const budget = parseBudget(req.body.budget);
    if (startDate && endDate && endDate < startDate) {
      return res.status(400).json({ message: 'La fecha final debe ser posterior a la fecha inicial' });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description: String(req.body.description || '').trim() || null,
        location: String(req.body.location || '').trim() || null,
        startDate: startDate || null,
        endDate: endDate || null,
        budget: budget || null,
        userId: Number(req.user.id)
      }
    });

    res.status(201).json({ ...project, accessRole: 'OWNER' });
  } catch (error) {
    if (error.message === 'Fecha inválida' || error.message.includes('presupuesto')) {
      return res.status(400).json({ message: error.message });
    }
    console.error('Error creando proyecto:', error);
    res.status(500).json({ message: 'Error creando proyecto' });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const where = req.user.role === 'ADMIN'
      ? {}
      : {
          OR: [
            { userId: Number(req.user.id) },
            { members: { some: { userId: Number(req.user.id) } } }
          ]
        };

    const projects = await prisma.project.findMany({
      where,
      include: {
        members: {
          where: { userId: Number(req.user.id) },
          select: { role: true }
        },
        _count: { select: { tasks: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json(projects.map((project) => {
      const role = accessRole(project, req.user, project.members[0] && project.members[0].role);
      const { members, ...data } = project;
      return { ...data, accessRole: role };
    }));
  } catch (error) {
    console.error('Error obteniendo proyectos:', error);
    res.status(500).json({ message: 'Error obteniendo proyectos' });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const { project, role } = await getProjectAccess(req.params.id, req.user);
    if (!project) return res.status(404).json({ message: 'Proyecto no encontrado' });
    if (!role) return res.status(403).json({ message: 'No tienes acceso a este proyecto' });

    const { members, user, ...data } = project;
    res.json({ ...data, owner: user, accessRole: role });
  } catch (error) {
    console.error('Error obteniendo proyecto:', error);
    res.status(500).json({ message: 'Error obteniendo proyecto' });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const access = await getProjectAccess(req.params.id, req.user);
    if (!access.project) return res.status(404).json({ message: 'Proyecto no encontrado' });
    if (!canManageProject(access.role)) return res.status(403).json({ message: 'Solo el propietario puede editar los datos del proyecto' });

    const data = {};
    if (Object.prototype.hasOwnProperty.call(req.body, 'name')) {
      const name = String(req.body.name || '').trim();
      if (!name) return res.status(400).json({ message: 'El nombre del proyecto es obligatorio' });
      data.name = name;
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'description')) {
      data.description = String(req.body.description || '').trim() || null;
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'location')) {
      data.location = String(req.body.location || '').trim() || null;
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'startDate')) data.startDate = parseDate(req.body.startDate);
    if (Object.prototype.hasOwnProperty.call(req.body, 'endDate')) data.endDate = parseDate(req.body.endDate);
    if (Object.prototype.hasOwnProperty.call(req.body, 'budget')) data.budget = parseBudget(req.body.budget);

    const finalStart = Object.prototype.hasOwnProperty.call(data, 'startDate') ? data.startDate : access.project.startDate;
    const finalEnd = Object.prototype.hasOwnProperty.call(data, 'endDate') ? data.endDate : access.project.endDate;
    if (finalStart && finalEnd && finalEnd < finalStart) {
      return res.status(400).json({ message: 'La fecha final debe ser posterior a la fecha inicial' });
    }

    const project = await prisma.project.update({
      where: { id: Number(req.params.id) },
      data
    });
    res.json({ ...project, accessRole: access.role });
  } catch (error) {
    if (error.message === 'Fecha inválida' || error.message.includes('presupuesto')) {
      return res.status(400).json({ message: error.message });
    }
    console.error('Error actualizando proyecto:', error);
    res.status(500).json({ message: 'Error actualizando proyecto' });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const access = await getProjectAccess(req.params.id, req.user);
    if (!access.project) return res.status(404).json({ message: 'Proyecto no encontrado' });
    if (!canManageProject(access.role)) return res.status(403).json({ message: 'Solo el propietario puede eliminar este proyecto' });

    await prisma.project.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Proyecto eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando proyecto:', error);
    res.status(500).json({ message: 'Error eliminando proyecto' });
  }
};

exports.getProjectMembers = async (req, res) => {
  try {
    const access = await getProjectAccess(req.params.id, req.user);
    if (!access.project) return res.status(404).json({ message: 'Proyecto no encontrado' });
    if (!canManageProject(access.role)) return res.status(403).json({ message: 'Solo el propietario puede administrar accesos' });

    const members = await prisma.projectMember.findMany({
      where: { projectId: Number(req.params.id) },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'asc' }
    });
    res.json({ owner: access.project.user, members });
  } catch (error) {
    console.error('Error consultando accesos del proyecto:', error);
    res.status(500).json({ message: 'Error consultando accesos' });
  }
};

exports.addProjectMember = async (req, res) => {
  try {
    const access = await getProjectAccess(req.params.id, req.user);
    if (!access.project) return res.status(404).json({ message: 'Proyecto no encontrado' });
    if (!canManageProject(access.role)) return res.status(403).json({ message: 'Solo el propietario puede compartir el proyecto' });

    const email = String(req.body.email || '').trim();
    const role = String(req.body.role || 'VIEWER').toUpperCase();
    if (!email) return res.status(400).json({ message: 'Escribe el correo de una persona registrada' });
    if (!['VIEWER', 'EDITOR'].includes(role)) return res.status(400).json({ message: 'Rol de proyecto inválido' });

    const user = await prisma.user.findFirst({
      where: { email: { equals: email } },
      select: { id: true, name: true, email: true }
    });
    if (!user) return res.status(404).json({ message: 'Primero debe crear una cuenta con ese correo' });
    if (user.id === access.project.userId) return res.status(400).json({ message: 'El propietario ya tiene acceso al proyecto' });

    const member = await prisma.projectMember.upsert({
      where: { projectId_userId: { projectId: Number(req.params.id), userId: user.id } },
      create: { projectId: Number(req.params.id), userId: user.id, role },
      update: { role },
      include: { user: { select: { id: true, name: true, email: true } } }
    });
    res.status(201).json(member);
  } catch (error) {
    console.error('Error compartiendo proyecto:', error);
    res.status(500).json({ message: 'Error compartiendo proyecto' });
  }
};

exports.removeProjectMember = async (req, res) => {
  try {
    const access = await getProjectAccess(req.params.id, req.user);
    if (!access.project) return res.status(404).json({ message: 'Proyecto no encontrado' });
    if (!canManageProject(access.role)) return res.status(403).json({ message: 'Solo el propietario puede quitar accesos' });

    await prisma.projectMember.deleteMany({
      where: { projectId: Number(req.params.id), userId: Number(req.params.userId) }
    });
    res.json({ message: 'Acceso retirado' });
  } catch (error) {
    console.error('Error quitando acceso:', error);
    res.status(500).json({ message: 'Error quitando acceso' });
  }
};
