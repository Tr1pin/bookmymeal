import { Router } from "express";
import { ProductCategoryController } from "../../controllers/data/productCategoryController.js";

const router = Router();

router.get('/', ProductCategoryController.getAll);
router.get('/:id', ProductCategoryController.getById);

export default router; 