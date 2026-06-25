/* ─────────────────────────────────
   Middleware de carga de archivos (Multer)
───────────────────────────────── */
// Gestiona el almacenamiento, renombrado y filtrado de las imagenes
// de las portadas de los libros subidas por los usuarios

const multer = require('multer');
const path = require('path');

// Configuracion del motor de almacenamiento en disco (DiskStorage)
const storage = multer.diskStorage({
    // Definicion de la carpeta donde se guardaran las fotos
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads')); //Almacena en la carpeta raiz /uploads
    },
    // Define la estrategia de nomenclatura de los archivos, en este caso genera un nombre unico para cada foto
    filename: (req, file, cb) => {
        // Combina la fecha actual con un numero aleatorio gigante
        const nombreUnico = Date.now() + '-' + Math.round(Math.random() * 1e9);
        // Retorna el nombre unico con la extension del archivo original
        cb(null, nombreUnico + path.extname(file.originalname)); 
    }
});


/* ─────────────────────────────────
   Instancia del middleware con limites de tamaño 
   y reglas de validacion
───────────────────────────────── */
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, //limite de 10mb por archivo
    // filtro de validacion del tipo de archivo (MimeType)
    fileFilter: (req, file, cb) => {
        // Verifica que el tipo de archivo sea del grupo 'image/'
        if (file.mimetype.startsWith('image/')) {
            cb(null,true); //archivo valido
        } else {
            // rechaza el archivo lanzadndo un error
            cb (new Error('Solo se permiten archivos de imagen.'));
        }
    }    
});

module.exports = upload;