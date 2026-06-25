/**
 * ───────────────────────────────── 
 * ENRUTADOR DE USUARIOS Y AUTENTICACIÓN (API / USUARIOS)
 * ───────────────────────────────── 
 * Controla el ciclo de registro, hashing de credenciales de seguridad (Bcrypt),
 * login de usuarios y mantenimiento de datos del perfil estudiantil.
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt'); // Librería criptográfica para protección de contraseñas
const db = require('../db/connection');

//POST /api/usuarios/registro - Registrar un nuevo usuario en la plataforma
router.post('/registro', async (req,res) =>{
    const {nombre_completo, email, telefono, password, id_carrera, acepto_terminos} = req.body;

        // Validar que se hayan proporcionado todos los campos necesarios
    if (!nombre_completo || !email || !telefono || !password) {
        return res.status(400).json({error: 'Faltan campos obligatorios'});
    }

    // Regla legal obligatoria (Exigida en el Frontend a través de los Términos y Condiciones)
    if (!acepto_terminos) {
        return res.status(400).json({ error: 'Debes aceptar los terminos y Condiciones.' });
    }

    try {
        // Valida si la dirección de correo ya posee una cuenta activa
        const [existentes] = await db.query('SELECT id_usuario FROM usuarios WHERE email = ?', [email]);
        if (existentes.length > 0) {
            return res.status(400).json({error: 'Ese correo ya esta registrado.'});
        }
    
        // Hashing Criptográfico (Capa de Seguridad Obligatoria)
        // Transforma el texto plano en una firma irreversible aplicando un Salt de 10 rondas
        const passwordHash = await bcrypt.hash(password, 10);

        // Insertar el nuevo usuario en la base de datos
        const [resultado] = await db.query(
            'INSERT INTO usuarios (nombre_completo, email, telefono, password, id_carrera) VALUES (?, ?, ?, ?, ?)',
            [nombre_completo, email, telefono, passwordHash, id_carrera]
        );
    
        // Retornar el ID del nuevo usuario registrado
        res.status(201).json({mensaje: 'Usuario registrado correctamente', id_usuario: resultado.insertId});

    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({error: 'Error al registrar usuario'});
    }
});

// POST /api/usuarios/login - Iniciar sesion
router.post('/login', async (req,res) => {
    const {email, password} = req.body;

    // Validar que se hayan proporcionado el email y la password
    if (!email || !password) {
        return res.status(400).json({error: 'Correo y Contraseña son obligatorios.'});
    }

    try {
        // Busca al usuario por su identificador único de correo (Excluye usuarios borrados)
        const [usuarios] = await db.query('SELECT * FROM usuarios WHERE email = ? AND borrado = 0', [email]);
    
        // Si la consulta viene vacía, corta la ejecución inmediatamente
        if (usuarios.length === 0){
            return res.status(400).json({error: 'Correo o contraseña incorrectos.' });
        }

        const usuario = usuarios[0];
      
        // Comparar la contraseña proporcionada.
        // Bcrypt extrae internamente el Salt del hash almacenado y compara matemáticamente el texto plano recibido
        const passwordValida = await bcrypt.compare(password, usuario.password);

        if (!passwordValida) {
            return res.status(401).json({error: 'Correo o contraseña incorrectos.' });
        }

        // Elimina la propiedad 'password' del objeto en memoria
        // Antes de despachar el JSON. Jamás se debe fugar el Hash de credenciales hacia la red del cliente.
        delete usuario.password;

        res.json({ mensaje: 'Inicio de sesion exitoso.', usuario })
        
    } catch (error) {
        console.error('Error al iniciar sesion:', error);
        res.status(500).json({error: 'Error al iniciar sesion'});
    }
});

// GET /api/usuarios/:id - Obtener datos limpios de un perfil, adjuntando el nombre legible de su carrera
router.get('/:id', async (req, res) => {
    
    
    try {
        // Realiza un JOIN relacional para mapear el ID de la carrera y obtener su nombre académico estructurado
        const [rows] = await db.query(
            `SELECT u.id_usuario, u.nombre_completo, u.email, u.telefono, u.id_carrera, c.nombre AS carrera
            FROM usuarios u
            JOIN carreras c ON u.id_carrera = c.id_carrera
            WHERE u.id_usuario = ? AND u.borrado = 0`,
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        res.json(rows[0]); // Envía directamente la primera y única coincidencia

    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({ error: 'Error al obtener el perfil.' });
    }
});

// PUT /api/usuarios/:id - Actualizar los campos editables del perfil del estudiante
router.put('/:id', async (req, res) => {
    const { nombre_completo, telefono, id_carrera } = req.body;

    // Validar que se hayan proporcionado todos los campos obligatorios
    if (!nombre_completo || !telefono || !id_carrera) {
        return res.status(400).json({ error: 'Faltan campos obligatorios.' });
    }

    try {
        const [resultado] = await db.query(
            `UPDATE usuarios
            SET nombre_completo=?, telefono=?, id_carrera=? 
            WHERE id_usuario=? AND borrado = 0`,
            [nombre_completo, telefono, id_carrera, req.params.id]
        );

        // Verifica si realmente hubo una alteración de datos o si la fila objetivo no existe
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado.'});
        }

        res.json({ mensaje: 'Perfil actualizado correctamente.'});
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        res.status(500).json({ error: 'Error al actualizar el perfil.' });
    }
});

module.exports = router;