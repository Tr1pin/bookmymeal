import { Router } from "express";
import { UserController } from "../../controllers/data/userController.js";

const router = Router();

//Getters de Usuarios
router.get('/user', UserController.getAll);
router.get('/user/id/:id', UserController.getById);
router.get('/user/tipo/:tipo', UserController.getByTipo);
router.get('/user/email/:email', UserController.getByEmail);
router.get('/user/nombre/:nombre', UserController.getByNombre);

//Post de Usuarios
router.post("/user", UserController.crearUsuario);
router.put("/user", UserController.actualizarUsuario);
router.put("/user/actualizarRol", UserController.actualizarRolUsuario);

//Delete Usuarios
router.delete("/user/:id", UserController.eliminarUsuario);

export default router;
