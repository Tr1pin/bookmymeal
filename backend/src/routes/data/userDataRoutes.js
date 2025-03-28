import { Router } from "express";
import { UserController } from "../../controllers/data/userController.js";

const router = Router();

//Getters de Usuarios
router.get('', UserController.getAll);
router.get('/id/:id', UserController.getById);
router.get('/tipo/:tipo', UserController.getByTipo);
router.get('/email/:email', UserController.getByEmail);
router.get('/nombre/:nombre', UserController.getByNombre);

//Post de Usuarios
router.post("", UserController.crearUsuario);
router.put("", UserController.actualizarUsuario);
router.put("/actualizarRol", UserController.actualizarRolUsuario);

//Delete Usuarios
router.delete("/:id", UserController.eliminarUsuario);

export default router;
