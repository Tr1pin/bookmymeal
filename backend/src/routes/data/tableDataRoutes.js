import { Router } from "express";
import { MesaController } from "../../controllers/data/tableController.js";

const router = Router();

router.get('', MesaController.getAll);
router.get('/id/:id', MesaController.getById);

// Operaciones CRUD
router.post("", MesaController.crearMesa);
router.put("", MesaController.actualizarMesa);
router.delete("/:id", MesaController.eliminarMesa);

export default router;