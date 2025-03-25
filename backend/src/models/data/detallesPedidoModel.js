import mysql from 'mysql2/promise';
import { randomUUID } from 'crypto';
import { DEFAULT_MYSQL_CONECTION } from '../../../config.js';
import { validateDetallePedido, validatePartialDetallePedido } from '../../schemas/detallesPedido.js';

const connectionString = process.env.DATABASE_URL ?? DEFAULT_MYSQL_CONECTION;

export class DetallePedidoModel {
    static async getAll() {
        const connection = await mysql.createConnection(connectionString);
        const [res] = await connection.query('SELECT * FROM detalles_pedidos');
        await connection.end();
        return res;
    }

    static async getById({ id }) {
        if (!id) throw new Error("El ID es requerido");

        const connection = await mysql.createConnection(connectionString);
        const [res] = await connection.query('SELECT * FROM detalles_pedidos WHERE id = ?', [id]);
        await connection.end();
        return res[0];
    }

    static async crearDetallePedido({ pedido_id, producto_id, cantidad, subtotal }) {
        if (!pedido_id || !producto_id || !cantidad || !subtotal) {
            throw new Error("Faltan datos para crear un detalle de pedido");
        }

        if(validateDetallePedido({pedido_id, producto_id, cantidad, subtotal}).error){
            throw new Error(validateDetallePedido(pedido_id, producto_id, cantidad, subtotal).error);
        }

        const uuid = randomUUID();

        const connection = await mysql.createConnection(connectionString);
        await connection.query('INSERT INTO detalles_pedidos (id, pedido_id, producto_id, cantidad, subtotal) VALUES (?, ?, ?, ?, ?)',
            [uuid, pedido_id, producto_id, cantidad, subtotal]);
        await connection.end();
        return { message: "Detalle de pedido creado correctamente" };
    }

    static async actualizarDetallePedido({ id, pedido_id, producto_id, cantidad, subtotal }) {
        if (!id) throw new Error("El ID es requerido");

        const updates = [];
        const values = {};

        if(validatePartialDetallePedido({pedido_id, producto_id, cantidad, subtotal}).error){
            throw new Error(validatePartialDetallePedido(pedido_id, producto_id, cantidad, subtotal).error);
        }

        if (pedido_id) updates.push("pedido_id = ?"), values.pedido_id = pedido_id;
        if (producto_id) updates.push("producto_id = ?"), values.producto_id = producto_id;
        if (cantidad) updates.push("cantidad = ?"), values.cantidad = cantidad;
        if (subtotal) updates.push("subtotal = ?"), values.subtotal = subtotal;
        if (!updates.length) throw new Error("No hay datos para actualizar");

        const connection = await mysql.createConnection(connectionString);
        const query = `UPDATE detalles_pedidos SET ${updates.join(", ")} WHERE id = ?`;
        const queryValues = [...Object.values(values), id];
        await connection.query(query, queryValues);
        await connection.end();
        return { message: "Detalle de pedido actualizado correctamente" };
    }

    static async eliminarDetallePedido({ id }) {
        if (!id) throw new Error("El ID es requerido");

        const connection = await mysql.createConnection(connectionString);
        await connection.query('DELETE FROM detalles_pedidos WHERE id = ?', [id]);
        await connection.end();
        return { message: "Detalle de pedido eliminado correctamente" };
    }
}