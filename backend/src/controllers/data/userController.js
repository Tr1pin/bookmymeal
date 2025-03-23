import { UserModel } from '../../models/data/userModel.js';

export class UserController {

    //Getters de Usuarios

    //Todos los usuarios
    static async getAll(req, res) {
        try {
            const users = await UserModel.getAll();
            res.status(200).json(users);
        } catch (err) {
            console.log("error");
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    //Usuario por ID
    static async getById(req, res) {
        try {
            const id = req.params.id;
            const users = await UserModel.getById({ id });
            res.status(200).json(users);
        } catch (err) {
            console.log("error");
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    //Usuario por tipo
    static async getByTipo(req, res) {
        try {
            const tipo = req.params.tipo;
            const users = await UserModel.getByTipo({ tipo });
            res.status(200).json(users);
        } catch (err) {
            console.log("error");
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    //Usuario por nombre
    static async getByNombre(req, res) {
        try {
            const nombre = req.params.nombre;
            const users = await UserModel.getByNombre({ nombre });
            res.status(200).json(users);
        } catch (err) {
            console.log("error");
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    //Uuario por email
    static async getByEmail(req, res) {
        try {
            const email = req.params.email;
            const users = await UserModel.getByEmail({ email });
            res.status(200).json(users);
        } catch (err) {
            console.log("error");
            res.status(500).json({ message: 'Internal server error' });
        }
    }


    //Crear Usuario

}