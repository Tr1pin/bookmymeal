import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
import { UserModel } from "../data/userModel.js";
import { JWT_SECRET } from "../../../config.js";

const KEY = process.env.SECRET_KEY ||  JWT_SECRET;

export class UserAuthModel {
    static async login({ email, password }) {
        try {
            console.log("Intentando iniciar sesión con email:", email);
            console.log("Contraseña proporcionada:", password);
            const user = await UserModel.getByEmail({ email: email });

            if (!user || !user.password) {
                return { message: "El usuario no existe" };
            }

            if (!password) {
                return { message: "La contraseña es obligatoria" };
            }
            
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return { message: "Usuario o contraseña incorrectos" };
            }

            const token = jwt.sign(
                { id: user.id, role: user.rol },
                KEY,
                { expiresIn: "2h" }
            );
    
            return { message: "Inicio de sesión exitoso", token };
        } catch (error) {
            console.error("Error en login:", error);
            return { message: "Error en el servidor" };
        }
    }

    static async register({ nombre, email, password, telefono }) {
        try {
            const user = await UserModel.createUsuario({ nombre, email, password, telefono });
            
            if (!user || !user.message) {
                throw new Error("No se pudo registrar el usuario");
            }
    
            return { message: "Usuario registrado correctamente"};
        } catch (error) {
            console.error("Error en el registro:", error.message);
            throw new Error("Error en el registro");
        }
    }
}