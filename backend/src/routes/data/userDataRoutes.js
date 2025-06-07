import { Router } from "express";
import { UserController } from "../../controllers/data/userController.js";
import { authMiddleware, adminMiddleware, ownerOrAdminMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();

//Getters de Usuarios (solo admin puede ver todos)
router.get('', authMiddleware, adminMiddleware, UserController.getAll);
router.get('/id/:id', authMiddleware, ownerOrAdminMiddleware, UserController.getById);
router.get('/tipo/:tipo', authMiddleware, adminMiddleware, UserController.getByTipo);
router.get('/email/:email', authMiddleware, adminMiddleware, UserController.getByEmail);
router.get('/nombre/:nombre', authMiddleware, adminMiddleware, UserController.getByNombre);

//Post de Usuarios (crear usuario puede ser público, pero actualizar requiere auth)
router.post("", UserController.crearUsuario);
router.put("", authMiddleware, ownerOrAdminMiddleware, UserController.actualizarUsuario);
router.put("/actualizarRol", authMiddleware, adminMiddleware, UserController.actualizarRolUsuario);

//Delete Usuarios (solo admin)
router.delete("/:id", authMiddleware, adminMiddleware, UserController.eliminarUsuario);

export default router;
