const prisma = require('../prisma/prisma');
const { getProjectAccess, canEditProject } = require('../utils/projectAccess');

const statuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED'];
const priorities = ['LOW', 'NORMAL', 'HIGH', 'CRITICAL'];

function parseDate(value) {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  const date = new Date(String(value).slice(0, 10) + 'T12:00:00.000Z');
  if (Number.isNaN(date.getTime())) throw new Error('Fecha inválida');
  return date;
}

function parseMoney(value, defaultValue) {
  if (value === undefined) return defaultValue;
  if (value === null || value === '') return '0.00';
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) throw new Error('Los costos deben ser valores positivos');
  return amount.toFixed(2);
}

function parsePredecessors(value) {
  if (value === undefined) return undefined;
  const source = Array.isArray(value) ? value : String(value || '').split(/[,\s]+/);
  const ids = source.map(Number).filter((id) => Number.isInteger(id) && id > 0);
  return Array.from(new Set(ids));
}

function taskData(body, partial) {
  const data = {};
  if (!partial || Object.prototype.hasOwnProperty.call(body, 'name')) {
    const name = String(body.name || '').trim();
    if (!name) throw new Error('El nombre de la actividad es obligatorio');
    data.name = name;
  }
  if (!partial || Object.prototype.hasOwnProperty.call(body, 'description')) {
    data.description = String(body.description || '').trim() || null;
  }
  if (!partial || Object.prototype.hasOwnProperty.call(body, 'assignedTo')) {
    data.assignedTo = String(body.assignedTo || '').trim() || null;
  }
  if (!partial || Object.prototype.hasOwnProperty.call(body, 'startDate')) data.startDate = parseDate(body.startDate);
  if (!partial || Object.prototype.hasOwnProperty.call(body, 'endDate')) data.endDate = parseDate(body.endDate);

  if (!partial || Object.prototype.hasOwnProperty.call(body, 'progress')) {
    const progress = Number(body.progress === undefined ? 0 : body.progress);
    if (!Number.isFinite(progress) || progress < 0 || progress > 100) throw new Error('El avance debe estar entre 0 y 100');
    data.progress = Math.round(progress);
  }

  if (Object.prototype.hasOwnProperty.call(body, 'status')) {
    const status = String(body.status).toUpperCase();
    if (!statuses.includes(status)) throw new Error('Estado de actividad inválido');
    data.status = status;
  } else if (Object.prototype.hasOwnProperty.call(data, 'progress')) {
    data.status = data.progress === 100 ? 'COMPLETED' : data.progress > 0 ? 'IN_PROGRESS' : 'PENDING';
  }

  if (Object.prototype.hasOwnProperty.call(body, 'priority')) {
    const priority = String(body.priority).toUpperCase();
    if (!priorities.includes(priority)) throw new Error('Prioridad inválida');
    data.priority = priority;
  } else if (!partial) {
    data.priority = 'NORMAL';
  }

  if (!partial || Object.prototype.hasOwnProperty.call(body, 'plannedCost')) {
    data.plannedCost = parseMoney(body.plannedCost, '0.00');
  }
  if (!partial || Object.prototype.hasOwnProperty.call(body, 'actualCost')) {
    data.actualCost = parseMoney(body.actualCost, '0.00');
  }
  if (Object.prototype.hasOwnProperty.call(body, 'predecessorIds')) {
    data.predecessorIds = parsePredecessors(body.predecessorIds);
  } else if (!partial) {
    data.predecessorIds = [];
  }
  if (data.status === 'COMPLETED') data.progress = 100;

  const startDate = data.startDate;
  const endDate = data.endDate;
  if (startDate && endDate && endDate < startDate) throw new Error('La fecha final debe ser posterior a la inicial');
  return data;
}

async function authorize(req, res, edit) {
  const access = await getProjectAccess(req.params.projectId, req.user);
  if (!access.project) {
    res.status(404).json({ message: 'Proyecto no encontrado' });
    return null;
  }
  if (!access.role) {
    res.status(403).json({ message: 'No tienes acceso a este proyecto' });
    return null;
  }
  if (edit && !canEditProject(access.role)) {
    res.status(403).json({ message: 'Tienes acceso de solo lectura' });
    return null;
  }
  return access;
}

exports.getTasks = async (req, res) => {
  try {
    if (!await authorize(req, res, false)) return;
    const tasks = await prisma.projectTask.findMany({
      where: { projectId: Number(req.params.projectId) },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }]
    });
    res.json(tasks);
  } catch (error) {
    console.error('Error obteniendo actividades:', error);
    res.status(500).json({ message: 'Error obteniendo actividades' });
  }
};

exports.createTask = async (req, res) => {
  try {
    if (!await authorize(req, res, true)) return;
    const data = taskData(req.body, false);
    const lastTask = await prisma.projectTask.findFirst({
      where: { projectId: Number(req.params.projectId) },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true }
    });
    data.sortOrder = (lastTask ? lastTask.sortOrder : 0) + 1;
    const task = await prisma.projectTask.create({
      data: { ...data, projectId: Number(req.params.projectId) }
    });
    res.status(201).json(task);
  } catch (error) {
    if (error.message.includes('obligatorio') || error.message.includes('debe') || error.message.includes('inválid') || error.message.includes('costos')) {
      return res.status(400).json({ message: error.message });
    }
    console.error('Error creando actividad:', error);
    res.status(500).json({ message: 'Error creando actividad' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    if (!await authorize(req, res, true)) return;
    const projectId = Number(req.params.projectId);
    const taskId = Number(req.params.taskId);
    const existing = await prisma.projectTask.findFirst({ where: { id: taskId, projectId } });
    if (!existing) return res.status(404).json({ message: 'Actividad no encontrada' });

    const data = taskData(req.body, true);
    const finalStart = Object.prototype.hasOwnProperty.call(data, 'startDate') ? data.startDate : existing.startDate;
    const finalEnd = Object.prototype.hasOwnProperty.call(data, 'endDate') ? data.endDate : existing.endDate;
    if (finalStart && finalEnd && finalEnd < finalStart) {
      return res.status(400).json({ message: 'La fecha final debe ser posterior a la inicial' });
    }

    const task = await prisma.projectTask.update({ where: { id: taskId }, data });
    res.json(task);
  } catch (error) {
    if (error.message.includes('obligatorio') || error.message.includes('debe') || error.message.includes('inválid') || error.message.includes('costos')) {
      return res.status(400).json({ message: error.message });
    }
    console.error('Error actualizando actividad:', error);
    res.status(500).json({ message: 'Error actualizando actividad' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    if (!await authorize(req, res, true)) return;
    const deleted = await prisma.projectTask.deleteMany({
      where: { id: Number(req.params.taskId), projectId: Number(req.params.projectId) }
    });
    if (!deleted.count) return res.status(404).json({ message: 'Actividad no encontrada' });
    res.json({ message: 'Actividad eliminada' });
  } catch (error) {
    console.error('Error eliminando actividad:', error);
    res.status(500).json({ message: 'Error eliminando actividad' });
  }
};
