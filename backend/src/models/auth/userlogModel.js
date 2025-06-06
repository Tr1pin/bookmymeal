import jwt from "jsonwebtoken";
import mysql from 'mysql2/promise'
import bcrypt from 'bcrypt';
import { UserModel } from "../data/userModel.js";
import { JWT_SECRET } from "../../../config.js";
import { DEFAULT_MYSQL_CONECTION, SALT_ROUNDS } from '../../../config.js'

const connectionString = process.env.DATABASE_URL ?? DEFAULT_MYSQL_CONECTION

const KEY = process.env.SECRET_KEY ||  JWT_SECRET;

export class UserAuthModel {
    static async login({ email, password }) {
        try {
            //Revisamos si el emial es correcto
            const user = await UserModel.getByEmail({ email: email });

            //Validaciones
            if (!user || !user.password) {
                return { message: "El usuario no existe" };
            }

            if (!password) {
                return { message: "La contraseña es obligatoria" };
            }
            
            //Validamos la contraseña encriptada en la db
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return { message: "Usuario o contraseña incorrectos" };
            }
    
            return { message: "Iniciando sesión", nombre:user.nombre };
        } catch (error) {
            console.error("Error en login:", error);
            return { message: "Error en el servidor" };
        }
    }

    static async login2FA({ email, codigo }) {
        try {
            //Revisamos si el emial es correcto
            const user = await UserModel.getByEmail({ email: email });

            //Validaciones
            if (!user || !user.password) {
                return { message: "El usuario no existe" };
            }

            const connection = await mysql.createConnection(connectionString);
            //Solo seleccionamos el codigo de 2FA que esta activo, que no haya expirado y que sea del usuario
            const [res] = await connection.query(
                `SELECT * FROM two_factor_codes WHERE user_id = ? AND activo = true AND fecha_creacion > DATE_SUB(NOW(), INTERVAL 5 MINUTE)`, 
                [user.id]
            );

            if (!codigo) {
                return { message: "El código es obligatorio" };
            }

            const codigoDB = res[0];

            if (!codigoDB || !codigoDB.codigo) {
                return { message: "El código no es válido" };
            }

            //Revisamos el codigo que se envio y el de la db
            const isMatch = await bcrypt.compare(codigo, codigoDB.codigo);
            if (!isMatch) {
                return { message: "El código no es válido" };
            }

            //Desactivamos el codigo de 2FA si es correcto
            const [res2] = await connection.query(
                `UPDATE two_factor_codes SET activo = false WHERE user_id = ?`, 
                [user.id]
            );

            await connection.end();

            const token = jwt.sign(
                { id: user.id, role: user.rol },
                KEY,
                { expiresIn: "2h" }
            ); 

            return { message: "Inicio de sesión exitoso", token };
        } catch (error) {
            console.error("Error en login2FA:");
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