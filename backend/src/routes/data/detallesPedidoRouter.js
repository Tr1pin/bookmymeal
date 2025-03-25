import { Router } from "express";
import { DetallePedidoController } from "../../controllers/data/detallesPedidoController.js";

const router = Router();

// Rutas CRUD para detalles de pedidos
//Getters
router.get('', DetallePedidoController.getAll);
router.get('/id/:id', DetallePedidoController.getById);

//Post, Put, Delete
router.post("", DetallePedidoController.crearDetallePedido);
router.put("", DetallePedidoController.actualizarDetallePedido);
router.delete("/:id", DetallePedidoController.eliminarDetallePedido);

export default router;
