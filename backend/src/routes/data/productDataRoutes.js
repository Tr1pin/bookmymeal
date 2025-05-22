import { Router } from "express";
import { ProductController } from "../../controllers/data/productController.js";
import { uploadImages } from '../../middlewares/multer.middleware.js';

const router = Router();

// Getters de Productos
router.get('', ProductController.getAll);
router.get('/productsImages', ProductController.getProductsImages);
router.get('/id/:id', ProductController.getById);
router.get('/nombre/:nombre', ProductController.getByNombre);
router.get('/disponible/', ProductController.getByDisponibilidad);

// Operaciones Create, Update y Delete.
router.post("", uploadImages.array('imagen', 10), ProductController.crearProducto);
router.put("", ProductController.actualizarProducto);
router.delete("/:id", ProductController.eliminarProducto);

export default router;