import { MesaModel } from '../../models/data/tableModel.js';

export class MesaController {
    static async getAll(req, res) {
        try {
            res.status(200).json(await MesaModel.getAll());
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    static async getById(req, res) {
        try {
            res.status(200).json(await MesaModel.getById({ id: req.params.id }));
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    static async crearMesa(req, res) {
        try {
            res.status(200).json(await MesaModel.crearMesa(req.body));
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    static async actualizarMesa(req, res) {
        try {
            res.status(200).json(await MesaModel.actualizarMesa(req.body));
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    static async eliminarMesa(req, res) {
        try {
            res.status(200).json(await MesaModel.eliminarMesa({ id: req.params.id }));
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
}
