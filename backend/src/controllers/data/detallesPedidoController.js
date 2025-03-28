import { DetallePedidoModel } from '../../models/data/detallesPedidoModel.js';

export class DetallePedidoController {
    static async getAll(req, res) {
        try { 
            res.status(200).json(await DetallePedidoModel.getAll()); 
        }
        catch (err) { 
            res.status(500).json({ message: err.message }); 
        }
    }

    static async getById(req, res) {
        try { 
            res.status(200).json(await DetallePedidoModel.getById({ id: req.params.id })); 
        }
        catch (err) { 
            res.status(500).json({ message: err.message }); 
        }
    }

    static async crearDetallePedido(req, res) {
        try { 
            res.status(200).json(await DetallePedidoModel.crearDetallePedido(req.body)); 
        }
        catch (err) { 
            res.status(500).json({ message: err.message }); 
        }
    }

    static async actualizarDetallePedido(req, res) {
        try { 
            res.status(200).json(await DetallePedidoModel.actualizarDetallePedido(req.body)); 
        }
        catch (err) { 
            res.status(500).json({ message: err.message }); 
        }
    }

    static async eliminarDetallePedido(req, res) {
        try { 
            res.status(200).json(await DetallePedidoModel.eliminarDetallePedido({ id: req.params.id })); 
        }
        catch (err) { 
            res.status(500).json({ message: err.message }); 
        }
    }
}
