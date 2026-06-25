/**
 * ───────────────────────────────── 
 * ENRUTADOR DE CARRERAS (API / CARRERAS)
 * ───────────────────────────────── 
 * Define los endpoints para la gestión y consulta de las carreras
 * registradas en el sistema.
 */
const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// GET /api/carreras - Obtener todas las carreras activas para el formulario de registro y perfil
router.get('/', async (req, res) =>{
    try {
        // Ejecuta la consulta estructurando el orden ascendente por nombre de carrera
        const [carreras] = await db.query('SELECT id_carrera, nombre FROM carreras ORDER BY nombre ASC');
        res.json(carreras);
    } catch (error) {
        console.error('Error al obtener carreras:', error);
        res.status(500).json({error: 'Error al obtener carreras'});
    }
})

module.exports = router;