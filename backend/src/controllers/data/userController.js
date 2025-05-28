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
            res.status(500).json({ message: err.message });
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
            res.status(500).json({ message: err.message });
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
            res.status(500).json({ message: err.message });
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
            res.status(500).json({ message: err.message });
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
            res.status(500).json({ message: err.message });
        }
    }

    //Crear Usuario
    static async crearUsuario(req, res) {
        try {
            const { nombre, email, password, telefono } = req.body;
            const user = await UserModel.createUsuario({ nombre, email, password, telefono });
            res.status(200).json(user);
        } catch (err) {
            console.log("error");
            res.status(500).json({ message: err.message });
        }
    }

    //Actualizar Usuario
    static async actualizarUsuario(req, res) {
        try {
            const { id, nombre, email, password, telefono } = req.body;
            const user = await UserModel.actualizarUsuario({ id, nombre, email, password, telefono });
            res.status(200).json(user);
        } catch (err) {
            console.log("error");
            res.status(500).json({ message: err.message });
        }
    }

    //Eliminar Usuario
    static async eliminarUsuario(req, res) {
        try {
            const { id } = req.params;
            const user = await UserModel.eliminarUsuario({ id });
            res.status(200).json(user);
        } catch (err) {
            console.log("error");
            res.status(500).json({ message: err.message });
        }
    }

    //Actualizar Rol del Usuario
    static async actualizarRolUsuario(req, res) {
        try {
            const { id, tipo } = req.body;
            const user = await UserModel.actualizarRolUsuario({ id, tipo });
            res.status(200).json(user);
        } catch (err) {
            console.log("error");
            res.status(500).json({ message: err.message });
        }
    }

}