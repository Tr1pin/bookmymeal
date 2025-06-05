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

    static async getPedidos(req, res) {
        try { 
            res.status(200).json(await PedidoModel.getPedidos()); 
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
            const result = await PedidoModel.crearPedido(req.body);

            await EmailService.sendEmail({
                 to: req.body.email_contacto, 
                 toName: req.body.nombre_contacto, 
                 subject: "pedido"
            });
            res.status(200).json(result); 
        }
        catch (err) { 
            console.error('Error en crearPedido:', err);
            res.status(500).json({ message: err.message }); 
        }
    }

    static async crearPedidoWithUser(req, res) {
        try { 
            const result = await PedidoModel.crearPedidoWithUser(req.body);
            res.status(200).json(result); 
        }
        catch (err) { 
            console.error('Error en crearPedidoWithUser:', err);
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

    static async getPedidosByUsername(req, res) {
        try { 
            const username = req.params.username;
            res.status(200).json(await PedidoModel.getPedidosByUsername(username)); 
        }
        catch (err) { 
            res.status(500).json({ message: err.message }); 
        }
    }
}
