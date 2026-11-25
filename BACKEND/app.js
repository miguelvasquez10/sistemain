const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const passwordRoutes = require('./routes/password.routes');
const userRoutes = require('./routes/user.routes');
const projectRoutes = require('./routes/project.routes');
const taskRoutes = require('./routes/task.routes');
const serviceRoutes = require('./routes/service.routes');
const formRoutes = require('./routes/form.routes');
const formFieldRoutes = require('./routes/formField.routes');
const formResponseRoutes = require('./routes/formResponse.routes');
const photoRoutes = require('./routes/formPhoto.routes');
const reportRoutes = require('./routes/report.routes');
const serviceCatalogRoutes = require('./routes/serviceCatalog.routes');




const app = express();

app.use('/uploads', express.static('uploads'));


/* =======================================================
   🔥 2️⃣ CORS (SOLO UNO)
   ======================================================= */

const allowedOrigins = [
  'http://localhost:5173',
  'http://10.3.1.122:3001',
  'http://ecosistema.colmayor.edu.co',
  'https://ecosistema.colmayor.edu.co'
];

app.use(cors({
  origin: function (origin, callback) {

    // 🔥 Permitir Puppeteer (sin origin)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

/* =======================================================
   🔥 3️⃣ BODY PARSERS
   ======================================================= */

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

/* =======================================================
   🔥 4️⃣ RUTAS API
   ======================================================= */

app.use('/api/users', userRoutes);

app.use('/api/password', passwordRoutes);

app.use('/api', projectRoutes);

app.use('/api', taskRoutes);

app.use('/api', serviceRoutes);

app.use('/api', formRoutes);

app.use('/api', formFieldRoutes);

app.use('/api', formResponseRoutes);

app.use('/api', photoRoutes);

app.use('/api', reportRoutes);

app.use('/api', serviceCatalogRoutes);

/* =======================================================
   HEALTH CHECK
   ======================================================= */

app.get('/', (req, res) => {
  res.send('API funcionando 🚀');
});

module.exports = app;
