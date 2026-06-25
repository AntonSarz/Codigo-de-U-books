/* ─────────────────────────────────
   Servidor Principal - Nucleo de la aplicacion (Express)
───────────────────────────────── */
// Este es el punto de entrada del backend. Orquesta el ciclo de vida del servidor,
// los middlewares, el enrutamiento de la api y la entrega de datos al frontend.

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();  //Carga las variables globales antes de iniciar el servidor


//Importacion de los modulos de entrutamiento (los Endpoints de la API)
const materiasRoutes = require('./routes/materias');
const carrerasRoutes = require('./routes/carreras');
const usuariosRoutes = require('./routes/usuarios');
const anunciosRoutes = require('./routes/anuncios');

const app = express(); //esto crea una nueva aplicación de Express (la inicializa), que es un framework 
                        //para construir servidores web en Node.js


/* ─────────────────────────────────────────────────────────────────────────────
   MIDDLEWARES GLOBALES
───────────────────────────────────────────────────────────────────────────── */
app.use(cors());          //Habilita el middleware de CORS (el mecanismo de intercambio de datos entre el frontend y el backend)
app.use(express.json()); //Analaizador (Parser) incorporado para interpretar cuerpos de carga en formato JSON
                        // (leer el json en el body de las peticiones)


/* ─────────────────────────────────────────────────────────────────────────────
   HOSTING DE ARCHIVOS ESTÁTICOS (ARQUITECTURA UNIFICADA)
───────────────────────────────────────────────────────────────────────────── */
//Configura la ruta absoluta hacia el directorio del frontend
const frontendPath = path.join(__dirname, '../Frontend');
console.log('Buscando frontend en:', frontendPath);

// Sirve de manera estatica todos los archivos del cliente
app.use(express.static(frontendPath));

// Endpoint raiz: Redirife automaticamente el trafico hacia el login
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/login.html'));
});

/* ─────────────────────────────────────────────────────────────────────────────
   ENRUTAMIENTO DE LA API Y RECURSOS
───────────────────────────────────────────────────────────────────────────── */
app.use('/api/materias', materiasRoutes);
app.use('/api/carreras', carrerasRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/anuncios', anunciosRoutes);

// Expone publicamente la carpeta de subida de fotos para que sean accesibles via URL
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ─────────────────────────────────────────────────────────────────────────────
   ARRANQUE DEL SERVIDOR
───────────────────────────────────────────────────────────────────────────── */
const PORT = process.env.PORT || 3000;

// Escucha en la interfaz 0.0.0.0 (todas las interfaces) para aceptar peticiones de cualquier origen
app.listen(PORT, '0.0.0.0', () =>{
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});