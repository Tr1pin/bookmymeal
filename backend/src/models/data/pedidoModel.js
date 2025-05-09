import mysql from 'mysql2/promise';
import { randomUUID } from 'crypto';
import { DEFAULT_MYSQL_CONECTION } from '../../../config.js';
import { validatePedido, validatePartialPedido } from '../../../schemas/pedido.js';
import { UserModel } from '../../models/data/userModel.js';

const connectionString = process.env.DATABASE_URL ?? DEFAULT_MYSQL_CONECTION;

export class PedidoModel {
    static async getAll() {
        const connection = await mysql.createConnection(connectionString);
        const [res] = await connection.query('SELECT * FROM pedidos');
        await connection.end();
        return res;
    }

    static async getById({ id }) {
        if (!id) throw new Error("El ID es requerido");
        const connection = await mysql.createConnection(connectionString);
        const [res] = await connection.query('SELECT * FROM pedidos WHERE id = ?', [id]);
        await connection.end();
        return res[0];
    }

    static async crearPedido({ usuario_id, total, estado }) {
        if (!usuario_id || !total || !estado) {
            throw new Error("Faltan datos para crear un pedido");
        }
        const uuid = randomUUID();

        if(validatePedido({usuario_id, total, estado}).error){
            throw new Error(validatePedido(usuario_id, total, estado).error);
        }

        if(!UserModel.getById({id: usuario_id})){
            throw new Error("El usuario no existe");
        }

        const connection = await mysql.createConnection(connectionString);
        await connection.query('INSERT INTO pedidos (id, usuario_id, total, estado) VALUES (?, ?, ?, ?)',
            [uuid, usuario_id, total, estado]);
        
        await connection.end();
        return { message: "Pedido creado correctamente" };
    }

    static async actualizarPedido({ id, estado }) {
        if (!id || !estado) throw new Error("ID y estado son requeridos");

        if(validatePartialPedido({estado}).error){
            throw new Error(validatePartialPedido(estado).error);
        }

        const connection = await mysql.createConnection(connectionString);
        await connection.query('UPDATE pedidos SET estado = ? WHERE id = ?', [estado, id]);
        await connection.end();
        return { message: "Pedido actualizado correctamente" };
    }

    static async eliminarPedido({ id }) {
        if (!id) throw new Error("El ID es requerido");
        
        const connection = await mysql.createConnection(connectionString);
        await connection.query('DELETE FROM pedidos WHERE id = ?', [id]);
        await connection.end();
        return { message: "Pedido eliminado correctamente" };
    }
}