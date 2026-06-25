/**
 * ───────────────────────────────── 
 * ENRUTADOR DE MATERIAS (API / MATERIAS)
 * ───────────────────────────────── 
 * Define los endpoints para la gestión y consulta de las asignaturas
 * registradas en el sistema.
 */
const express = require('express');
const router = express.Router();
const db = require('../db/connection'); // Modulo de conexiones a la base de datos

// GET /api/materias - Obtener la lista de materias para filtros y formularios
router.get('/', async (req, res) =>{
    try {
        //Desestructuracion de arreglos para extraer unicamente las filas del resultado sql
        const [materias] = await db.query('SELECT id_materia, nombre FROM materias ORDER BY nombre ASC');
        
        // Retorna el listado ordenado alfabéticamente en formato JSON
        res.json(materias);
    
    } catch (error) {
        console.error('Error al obtener materias:', error);
        // Error de servidor (HTTP 500) ante fallos de infraestructura o sintaxis SQL
        res.status(500).json({error: 'Error al obtener materias'});
    }
})

module.exports = router;