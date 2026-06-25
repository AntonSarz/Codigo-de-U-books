const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const materiasRoutes = require('./routes/materias');
const carrerasRoutes = require('./routes/carreras');
const usuariosRoutes = require('./routes/usuarios');
const anunciosRoutes = require('./routes/anuncios');

const app = express(); //esto crea una nueva aplicación de Express, que es un framework 
                        //para construir servidores web en Node.js

app.use(cors()); //esto permite que el frontend pueda hablarle a el backend sin problemas
app.use(express.json()); //esto permite que el backend pueda entender los datos que le manda el frontend 
                        // (leer el json en el body de las peticiones)

//Servir los archivos estaticos del frontend
const frontendPath = path.join(__dirname, '../Frontend');
console.log('Buscando frontend en:', frontendPath);
app.use(express.static(frontendPath));

// Redirigir la raíz al login
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/login.html'));
});

app.use('/api/materias', materiasRoutes);
app.use('/api/carreras', carrerasRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/anuncios', anunciosRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); //esto permite que el fronte end pueda acceder a las fotos

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () =>{
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});