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

    //Lista de pedidos con su lista de productos
    static async getPedidos() {
        const connection = await mysql.createConnection(connectionString);
        const [res] = await connection.query(
            `SELECT 
                p.id AS pedido_id, 
                p.numero_pedido,
                u.nombre AS nombre_usuario,
                p.estado, 
                p.total,
                p.usuario_id, 
                pr.nombre AS producto, 
                pr.precio, 
                dp.cantidad, 
                dp.subtotal 
            FROM pedidos p 
            JOIN usuarios u ON p.usuario_id = u.id
            JOIN detalles_pedido dp ON p.id = dp.pedido_id 
            JOIN productos pr ON dp.producto_id = pr.id 
            ORDER BY p.id;
        `);
        
        const pedidosAgrupados = [];
        for (const item of res) {
            let pedido = pedidosAgrupados.find(p => p.pedido_id === item.pedido_id);
            if (!pedido) {
                    pedido = {
                    pedido_id: item.pedido_id,
                    estado: item.estado,
                    total: item.total,
                    numero_pedido: item.numero_pedido,
                    productos: [],
                    usuario:{
                        nombre: '',
                        id: ''
                    }
                };
                pedidosAgrupados.push(pedido);

            }

            pedido.productos.push(
                {
                    nombre: item.producto,
                    cantidad: item.cantidad,
                    subtotal: item.subtotal,
                    precio: item.precio
                }
            );
            pedido.usuario = 
                {
                    nombre: item.nombre_usuario,
                    id: item.usuario_id
                }
            ;
        }

        await connection.end();
        return pedidosAgrupados;
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