const app = require('./app');

const PORT = process.env.PORT || 3010;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`Entorno: Miguel esta probando esto`);
});
