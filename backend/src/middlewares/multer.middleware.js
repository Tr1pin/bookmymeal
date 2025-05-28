import multer from 'multer';
import path from 'path';
import { randomUUID } from 'crypto';

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images/products');
  },
  filename: (req, file, cb) => {  
    const productNombre = req.body.nombre || 'unknown';
    
    // Generate a unique UUID v4 (completely random, no time dependency)
    const uniqueId = randomUUID().replace(/-/g, '').substring(0, 12);
    
    const ext = path.extname(file.originalname).toLowerCase();
    
    // Clean product name for filename (remove special characters and spaces)
    const cleanProductName = productNombre
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .substring(0, 20); // Limit length
    
    const uniqueName = `${cleanProductName}_${uniqueId}${ext}`;
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
