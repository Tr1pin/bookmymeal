import multer from 'multer';
import path from 'path';

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images/products');
  },
  filename: (req, file, cb) => {  
    const productId = req.body.id || 'unknown';
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
    const randomString = Math.random().toString(36).substring(2, 10);
    const ext = path.extname(file.originalname).toLowerCase();

    const uniqueName = `${productId}_${timestamp}_${randomString}${ext}`;
    cb(null, uniqueName);
  }
});

// Filtro de archivos .jpg
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if ((ext === '.jpg' || ext === '.jpeg') && mime === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos .jpg, .jpeg'), false);
  }
};

// Middleware para múltiples imágenes
const uploadImages = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB por archivo
}); // 'images' es el nombre del campo en el formulario, y 10 es el número máximo de archivos permitidos

export { uploadImages };
