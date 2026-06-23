const multer = require('multer');
const path = require('path');

// Configuracion de multer para almacenar los archivos en la carpeta 'uploads'
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads')); //carpeta donde se guardaran las fotos
    },
    filename: (req, file, cb) => {
        const nombreUnico = Date.now() + '-' + Math.round(Math.random() * 1e9); //esto genera un nombre unico para cada foto
        cb(null, nombreUnico + path.extname(file.originalname)); //conserva la extension del archivo original
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, //limite de 10mb por archivo
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null,true); //acepta solo archivos de imagen
        else cb (new Error('Solo se permiten archivos de imagen.'));
    }
});

module.exports = upload;