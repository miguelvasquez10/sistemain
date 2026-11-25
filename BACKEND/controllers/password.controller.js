const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { sendRecoveryMail } = require('../utils/mail');

const prisma = new PrismaClient();

/**
 * Solicitar recuperación
 */
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    return res.json({ message: "Si el correo existe, se enviará un enlace" });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken: token,
      resetTokenExpires: expires,
    },
  });

  const frontendUrl = process.env.FRONTEND_URL_PRODUCTION?.trim();

  if (!frontendUrl) {
    console.error("❌ FRONTEND_URL no está definida");
    return res.status(500).json({
      message: "Configuración del servidor incompleta",
    });
  }

  const link = `${frontendUrl}/reset-password?token=${token}`;

  await sendRecoveryMail(user.email, link);

  res.json({ message: "Correo de recuperación enviado" });
};


/**
 * Restablecer contraseña
 */
exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpires: {
        gte: new Date()
      }
    }
  });

  if (!user) {
    return res.status(400).json({ message: 'Token inválido o expirado' });
  }

  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashed,
      resetToken: null,
      resetTokenExpires: null
    }
  });

  res.json({ message: 'Contraseña actualizada correctamente' });
};
