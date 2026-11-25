const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendWelcomeMail } = require('../utils/reminderMail');

const prisma = new PrismaClient();

/**
 * REGISTRO
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validación básica
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    const exists = await prisma.user.findUnique({ where: { email } });

    if (exists) {
      return res.status(409).json({ message: "El correo ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    // 🔥 Enviar correo de bienvenida (sin romper el registro si falla)
    try {
      await sendWelcomeMail(user.email, user.name);
      console.log("📩 Correo de bienvenida enviado correctamente");
    } catch (mailError) {
      console.error("⚠️ Usuario creado pero falló el envío del correo:", mailError);
    }

    res.status(201).json(user);

  } catch (error) {
    console.error("❌ Error en register:", error);
    res.status(500).json({ error: error.message });
  }
};
/**
 * LOGIN
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { userId: user.id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * LISTAR USUARIOS
 */
exports.getUsers = async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      role: true,
      createdAt: true
    }
  });

  res.json(users);
};

/**
 * OBTENER USUARIO POR ID
 */
exports.getUserById = async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id: Number(id) },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      role: true,
      plantillas: true
    }
  });

  if (!user) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }

  res.json(user);
};

/**
 * DESACTIVAR USUARIO (soft delete)
 */
exports.disableUser = async (req, res) => {
  const { id } = req.params;

  await prisma.user.update({
    where: { id: Number(id) },
    data: { isActive: false }
  });

  res.json({ message: 'Usuario desactivado' });
};
