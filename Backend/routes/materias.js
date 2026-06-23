const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// GET /api/materias - Obtener todas las materias
router.get('/', async (req, res) =>{
    try {
        const [materias] = await db.query('SELECT id_materia, nombre FROM materias ORDER BY nombre ASC');
        res.json(materias);
    } catch (error) {
        console.error('Error al obtener materias:', error);
        res.status(500).json({error: 'Error al obtener materias'});
    }
})

module.exports = router;