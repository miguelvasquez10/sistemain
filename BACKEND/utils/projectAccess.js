const prisma = require('../prisma/prisma');

async function getProjectAccess(projectId, user) {
  const id = Number(projectId);
  if (!Number.isInteger(id) || id < 1 || !user) return { project: null, role: null };

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      members: {
        where: { userId: Number(user.id) },
        select: { role: true }
      }
    }
  });

  if (!project) return { project: null, role: null };
  if (user.role === 'ADMIN') return { project, role: 'ADMIN' };
  if (project.userId === Number(user.id)) return { project, role: 'OWNER' };

  const membership = project.members[0];
  return { project, role: membership ? membership.role : null };
}

function canEditProject(role) {
  return ['OWNER', 'ADMIN', 'EDITOR'].includes(role);
}

function canManageProject(role) {
  return ['OWNER', 'ADMIN'].includes(role);
}

module.exports = { getProjectAccess, canEditProject, canManageProject };
