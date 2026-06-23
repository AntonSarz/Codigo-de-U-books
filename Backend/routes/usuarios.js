const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db/connection');

//POST /api/usuarios/registro - Registrar un nuevo usuario
router.post('/registro', async (req,res) =>{
    const {nombre_completo, email, telefono, password, id_carrera, acepto_terminos} = req.body;

        // Validar que se hayan proporcionado todos los campos necesarios
    if (!nombre_completo || !email || !telefono || !password) {
        return res.status(400).json({error: 'Faltan campos obligatorios'});
    }

    // Validar que acepte los terminos y condiciones
    if (!acepto_terminos) {
        return res.status(400).json({ error: 'Debes aceptar los terminos y Condiciones.' });
    }

    try {
        // Verificar si el email ya esta registrado
        const [existentes] = await db.query('SELECT id_usuario FROM usuarios WHERE email = ?', [email]);
        if (existentes.length > 0) {
            return res.status(400).json({error: 'Ese correo ya esta registrado.'});
        }
    
        // Hashear la contraseña antes de guardarla
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
        //Buscar el usuario por email
        const [usuarios] = await db.query('SELECT * FROM usuarios WHERE email = ? AND borrado = 0', [email]);
    
        // Si no se encuentra el usuario, retornar un error
        if (usuarios.length === 0){
            return res.status(400).json({error: 'Correo o contraseña incorrectos.' });
        }

        // Comparar la contraseña proporcionada con el hash almacenado en la base de datos
        const usuario = usuarios[0];
        const passwordValida = await bcrypt.compare(password, usuario.password);

        if (!passwordValida) {
            return res.status(401).json({error: 'Correo o contraseña incorrectos.' });
        }

        //No devolver nunca el hash de la contraseña al frontend
        delete usuario.password;

        res.json({ mensaje: 'Inicio de sesion exitoso.', usuario })
        
    } catch (error) {
        console.error('Error al iniciar sesion:', error);
        res.status(500).json({error: 'Error al iniciar sesion'});
    }
});

// GET /api/usuarios/:id - Obtener los datos del usuario logueado
router.get('/:id', async (req, res) => {
    
    
    try {
        const [rows] = await db.query(
            `SELECT u.id_usuario, u.nombre_completo, u.email, u.telefono, c.nombre AS carrera
            FROM usuarios u
            JOIN carreras c ON u.id_carrera = c.id_carrera
            WHERE u.id_usuario = ? AND u.borrado = 0`,
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({ error: 'Error al obtener el perfil.' });
    }
});

// PUT /api/usuarios/:id - Guardar los cambios del perfil
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