import { PedidoModel } from '../../models/data/pedidoModel.js';

export class PedidoController {
    static async getAll(req, res) {
        try { 
            res.status(200).json(await PedidoModel.getAll()); 
        }
        catch (err) { 
            res.status(500).json({ message: err.message }); 
        }
    }

    static async getById(req, res) {
        try { 
            res.status(200).json(await PedidoModel.getById({ id: req.params.id })); 
        }
        catch (err) { 
            res.status(500).json({ message: err.message }); 
        }
    }

    static async crearPedido(req, res) {
        try { 
            res.status(200).json(await PedidoModel.crearPedido(req.body)); 
        }
        catch (err) { 
            res.status(500).json({ message: err.message }); 
        }
    }

    static async actualizarPedido(req, res) {
        try { 
            res.status(200).json(await PedidoModel.actualizarPedido(req.body)); 
        }
        catch (err) { 
            res.status(500).json({ message: err.message }); 
        }
    }

    static async eliminarPedido(req, res) {
        try { 
            res.status(200).json(await PedidoModel.eliminarPedido({ id: req.params.id })); 
        }
        catch (err) { 
            res.status(500).json({ message: err.message }); 
        }
    }
}
