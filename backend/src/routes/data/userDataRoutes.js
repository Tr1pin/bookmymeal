import { Router } from "express";
import { UserController } from "../../controllers/data/userController.js";

const router = Router();

router.get('/users', UserController.getAll);
router.get('/users/id/:id', UserController.getById);
router.get('/users/tipo/:tipo', UserController.getByTipo);
router.get('/users/email/:email', UserController.getByEmail);
router.get('/users/nombre/:nombre', UserController.getByNombre);

export default router;
