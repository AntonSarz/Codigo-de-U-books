const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// GET /api/carreras - Obtener todas las carreras
router.get('/', async (req, res) =>{
    try {
        const [carreras] = await db.query('SELECT id_carrera, nombre FROM carreras ORDER BY nombre ASC');
        res.json(carreras);
    } catch (error) {
        console.error('Error al obtener carreras:', error);
        res.status(500).json({error: 'Error al obtener carreras'});
    }
})

module.exports = router;