import { Router } from "express";
import { PedidoController } from "../../controllers/data/pedidoController.js";

const router = Router();

// Rutas CRUD para pedidos
//Getters
router.get('', PedidoController.getAll);
router.get('/pedidosProductos', PedidoController.getPedidos);
router.get('/id/:id', PedidoController.getById);

//Post, Put, Delete
router.post("", PedidoController.crearPedido);
router.put("", PedidoController.actualizarPedido);
router.delete("/:id", PedidoController.eliminarPedido);

export default router;