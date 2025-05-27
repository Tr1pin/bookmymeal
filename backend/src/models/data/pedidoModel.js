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
            WHERE p.id = ?`,
            [id]
        );

        if (res.length === 0) {
            return null;
        }

        // Estructura exacta solicitada
        const pedido = {
            estado: res[0].estado,
            numero_pedido: res[0].numero_pedido,
            pedido_id: res[0].pedido_id,
            total: res[0].total,
            productos: res.map(item => ({
                nombre: item.producto,
                cantidad: item.cantidad,
                subtotal: item.subtotal,
                precio: item.precio
            })),
            usuario: {
                id: res[0].usuario_id,
                nombre: res[0].nombre_usuario
            }
        };

        await connection.end();
        return pedido;
    }

    static async crearPedido({ usuario_id, total, estado, productos }) {
        if (!usuario_id || !total || !estado || !productos || productos.length === 0) {
            throw new Error("Faltan datos para crear un pedido");
        }

        const uuid = randomUUID();
        const numero_pedido = Math.floor(Math.random() * 1000) + 1; // Generar número de pedido aleatorio

        if(validatePedido({usuario_id, total, estado}).error){
            throw new Error(validatePedido(usuario_id, total, estado).error);
        }

        if(!UserModel.getById({id: usuario_id})){
            throw new Error("El usuario no existe");
        }

        const connection = await mysql.createConnection(connectionString);
        
        try {
            await connection.beginTransaction();

            // Insertar el pedido
            await connection.query(
                'INSERT INTO pedidos (id, usuario_id, numero_pedido, total, estado) VALUES (?, ?, ?, ?, ?)',
                [uuid, usuario_id, numero_pedido, total, estado]
            );

            // Insertar los detalles del pedido
            for (const producto of productos) {
                await connection.query(
                    'INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad, subtotal) VALUES (?, ?, ?, ?)',
                    [uuid, producto.producto_id, producto.cantidad, producto.subtotal]
                );
            }

            await connection.commit();
            await connection.end();
            
            return { 
                message: "Pedido creado correctamente",
                pedido: {
                    pedido_id: uuid,
                    numero_pedido: numero_pedido.toString(),
                    estado,
                    total: total.toString(),
                    productos: productos.map(p => ({
                        ...p,
                        subtotal: p.subtotal.toString()
                    })),
                    usuario: {
                        id: usuario_id,
                        nombre: '' // El nombre se obtiene en la consulta de getPedidos
                    }
                }
            };
        } catch (error) {
            await connection.rollback();
            await connection.end();
            throw error;
        }
    }

    static async actualizarPedido({ id, estado }) {
        if (!id || !estado) throw new Error("ID y estado son requeridos");

        const validacion = validatePartialPedido({ id, estado });
        if (!validacion.success) {
            throw new Error(JSON.stringify(validacion.error.errors));
        }

        const connection = await mysql.createConnection(connectionString);
        try {
            await connection.query('UPDATE pedidos SET estado = ? WHERE id = ?', [estado, id]);
            await connection.end();
            return { message: "Pedido actualizado correctamente" };
        } catch (error) {
            await connection.end();
            throw new Error(`Error al actualizar el pedido: ${error.message}`);
        }
    }

    static async eliminarPedido({ id }) {
        if (!id) throw new Error("El ID es requerido");
        
        const connection = await mysql.createConnection(connectionString);
        await connection.query('DELETE FROM pedidos WHERE id = ?', [id]);
        await connection.end();
        return { message: "Pedido eliminado correctamente" };
    }

    static async getPedidosByUsername(username) {
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
            WHERE u.nombre LIKE ?
            ORDER BY p.id;`,
            [`%${username}%`]
        );
        
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
}