/**
 * ───────────────────────────────── 
 * ENRUTADOR DE ANUNCIOS / LIBROS (API / ANUNCIOS)
 * ───────────────────────────────── 
 * Módulo para el CRUD de anuncios de venta/intercambio de libros.
 * Integra operaciones relacionales complejas (JOINs) y carga de archivos estáticos.
 */

const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const upload = require('../middlewares/upload'); //Middleware Multer para subir fotos (Multi-part)

// GET /api/anuncios -> Obtener anuncios públicos disponibles (Feed principal del catálogo)
router.get('/', async (req, res) =>{
    try{
        // Relaciona tablas mediante JOINs para traer datos unificados (Materia, Datos de contacto)
        // Filtra por anuncios que no estén eliminados (borrado=0) y sigan listados como disponibles (disponible=1)
        const [anuncios] = await db.query(`SELECT a.id_anuncio, a.titulo, a.autor, a.edicion, a.condicion, 
            a.disponible, a.foto_url, a.fecha, u.telefono, a.id_materia, m.nombre AS materia 
        FROM anuncios a 
        JOIN materias m ON a.id_materia = m.id_materia 
        JOIN usuarios u ON a.id_usuario = u.id_usuario
        WHERE a.borrado = 0 AND a.disponible = 1
        ORDER BY a.fecha DESC
        `);
    res.json(anuncios);
            
    } catch(error){
        console.error('Error al obtener anuncios:', error);
        res.status(500).json({ error: 'Error al obtener los anuncios.' });
    }
});

// GET /api/anuncios/usuario/:id_usuario -> Obtener el historial de anuncios creados por un usuario específico (Para Vista Perfil)
router.get('/usuario/:id_usuario', async (req, res) => {
    try{
        // // Consulta parametrizada usando el placeholder '?' para prevenir Inyección SQL
        const [anuncios] = await db.query(`SELECT a.id_anuncio, a.titulo, a.autor, a.edicion, a.condicion, 
            a.disponible, a.foto_url, a.fecha, a.id_materia, m.nombre AS materia
            FROM anuncios a
            JOIN materias m ON a.id_materia = m.id_materia
            WHERE a.id_usuario = ? AND a.borrado = 0
            ORDER BY a.fecha DESC
            `, [req.params.id_usuario]); // Inyección segura del parámetro capturado en la URL
            
            res.json(anuncios);
    
        } catch(error){
            console.error('Error al obtener anuncios del usuario:', error);
            res.status(500).json({ error: 'Error al obtener los anuncios.'});
    }
});

// POST /api/anuncios -> Crear un nuevo anuncio de libro (Recibe datos multipart/form-data)
router.post('/', upload.single('foto'), async (req, res) => {
    // Los campos de texto planos viajan en el body del Form-Data
    const { id_usuario, titulo, autor, id_materia, edicion, condicion } = req.body;

    // Validación estricta del Backend: Valida campos requeridos y la existencia física del archivo subido
    if (!id_usuario || !titulo || !autor || !id_materia || !req.file) {
        return res.status(400).json({ error: 'Faltan campos obligatorios o la foto del libro.' });
    }

    // Guardar la imagen dentro del servidor a través de una ruta relativa
    const foto_url = `/uploads/${req.file.filename}`;

    // Insertar el nuevo anuncio en la base de datos
    try {
        // Inserción relacional: Traduce cadenas lógicas a campos numéricos booleanos de DB (Nuevo = 1, Usado = 0)
        const [resultado] = await db.query(
            `INSERT INTO anuncios (id_usuario, titulo, autor, id_materia, edicion, condicion, foto_url)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id_usuario, titulo, autor, id_materia, edicion || null, condicion === 'Nuevo' ? 1 : 0, foto_url]
        );

        // Respuesta HTTP 201 (Creado con Éxito). Retorna el insertId de la fila autoincremental
        res.status(201).json({ mensaje: 'Anuncio publicado correctamente.', id_anuncio: resultado.insertId });
    
    } catch (error) {
        console.error('Error al crear anuncio:', error);
        res.status(500).json({ error: 'Error al publicar el anuncio.' });
    }
});

// PUT /api/anuncios/:id -> Actualizar los datos de un anuncio existente (Permite sustitución opcional de imagen)
router.put('/:id', upload.single('foto'), async (req, res) => {
    const { titulo, autor, id_materia, edicion, condicion } = req.body;
    const { id } = req.params;

    // Validar que se hayan proporcionado los campos necesarios
    if (!titulo || !autor || !id_materia) {
        return res.status(400).json({ error: 'Faltan campos obligatorios.' });
    }

    try {
        // Bifurcación lógica: Evalúa si Multer procesó una nueva imagen en la petición
        if (req.file) {

           // Si subieron una foto nueva, tambien se actualizara foto_url
            const foto_url = `/uploads/${req.file.filename}`;
            await db.query(
                `UPDATE anuncios SET titulo=?, autor=?, id_materia=?, edicion=?, condicion=?, foto_url=? 
                WHERE id_anuncio=?`,
                [titulo, autor, id_materia, edicion || null, condicion === 'Nuevo' ? 1 : 0, foto_url, id]
            );

        } else {

             // Si el usuario no subio una foto nueva (se conserva la anterior)
            await db.query(
                `UPDATE anuncios SET titulo=?, autor=?, id_materia=?, edicion=?, condicion=?
                WHERE id_anuncio=?`,
                [titulo, autor, id_materia, edicion || null, condicion === 'Nuevo' ? 1 : 0, id]
            );
        }

        res.json({ mensaje: 'Anuncio editado correctamente.' });

    } catch (error) {
        console.error('Error al actualizar anuncio:', error);
        res.status(500).json({ error: 'Error al actualizar el anuncio.' });
    }
});

// PATCH /api/anuncios/:id/disponibilidad -> Cambiar estado de venta (Toggle de disponible/vendido) sin alterar los datos del libro
router.patch('/:id/disponibilidad', async (req, res) => {
    const { disponible } = req.body //true o false

    try {
        // Traduce el valor booleano a entero TinyInt de MySQL (1 o 0)
        await db.query('UPDATE anuncios SET disponible = ? WHERE id_anuncio = ?', [disponible ? 1 : 0, req.params.id]);
        res.json({ mensaje: 'Disponibilidad actualizada.' });
    } catch (error) {
        console.error('Error al actualizar disponibilidad:', error);
        res.status(500).json({ error: 'Error al actualizar la disponibilidad.' });
    }
});

// DELETE /api/anuncios/:id -> Borrado lógico de un anuncio
router.delete('/:id', async (req, res) => {
    try {
        // Estrategia de Borrado Lógico: No se usa un DELETE físico para evitar romper 
        // historiales o generar índices huérfanos. Se actualiza una bandera indicadora (borrado = 1).
        await db.query('UPDATE anuncios SET borrado = 1 WHERE id_anuncio = ?', [req.params.id]);
        res.json({ mensaje: 'Anuncio borrado.' });
    } catch (error) {
        console.error('Error al eliminar anuncio:', error);
        res.status(500).json({ error: 'Error al eliminar el anuncio.' });
    }
});

module.exports = router;