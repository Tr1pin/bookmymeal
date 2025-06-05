import mysql from 'mysql2/promise';
import { randomUUID } from 'crypto';
import { DEFAULT_MYSQL_CONECTION } from '../../../config.js';
import { validatePedido, validatePartialPedido } from '../../../schemas/pedido.js';
import { UserModel } from '../../models/data/userModel.js';
import { EmailService } from '../../services/email.service.js';

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
        const [res] = await connection.query(`
            SELECT 
                p.id AS pedido_id, 
                p.numero_pedido,
                COALESCE(p.nombre_contacto, u.nombre, 'Cliente anónimo') AS nombre_usuario,
                COALESCE(p.telefono_contacto, u.telefono, p.direccion_telefono) AS telefono,
                p.tipo_entrega,
                p.metodo_pago,
                CASE 
                    WHEN p.tipo_entrega = 'domicilio' THEN CONCAT(p.direccion_calle, ', ', p.direccion_ciudad, ' ', p.direccion_codigo_postal)
                    ELSE 'Recogida en tienda'
                END AS direccion_entrega,
                p.estado, 
                p.total,
                p.fecha_creacion,
                p.usuario_id, 
                pr.nombre AS producto, 
                pr.precio, 
                dp.cantidad, 
                dp.subtotal 
            FROM pedidos p 
            LEFT JOIN usuarios u ON p.usuario_id = u.id
            JOIN detalles_pedido dp ON p.id = dp.pedido_id 
            JOIN productos pr ON dp.producto_id = pr.id 
            ORDER BY p.fecha_creacion DESC, p.numero_pedido;
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
                    tipo_entrega: item.tipo_entrega,
                    metodo_pago: item.metodo_pago,
                    direccion_entrega: item.direccion_entrega,
                    fecha_creacion: item.fecha_creacion,
                    productos: [],
                    usuario:{
                        nombre: '',
                        telefono: '',
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
                    telefono: item.telefono,
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
                COALESCE(p.nombre_contacto, u.nombre, 'Cliente anónimo') AS nombre_usuario,
                COALESCE(p.telefono_contacto, u.telefono, p.direccion_telefono) AS telefono,
                p.tipo_entrega,
                p.metodo_pago,
                CASE 
                    WHEN p.tipo_entrega = 'domicilio' THEN CONCAT(p.direccion_calle, ', ', p.direccion_ciudad, ' ', p.direccion_codigo_postal)
                    ELSE 'Recogida en tienda'
                END AS direccion_entrega,
                p.estado, 
                p.total,
                p.fecha_creacion,
                p.usuario_id, 
                pr.nombre AS producto, 
                pr.precio, 
                dp.cantidad, 
                dp.subtotal 
            FROM pedidos p 
            LEFT JOIN usuarios u ON p.usuario_id = u.id
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
            tipo_entrega: res[0].tipo_entrega,
            metodo_pago: res[0].metodo_pago,
            direccion_entrega: res[0].direccion_entrega,
            fecha_creacion: res[0].fecha_creacion,
            productos: res.map(item => ({
                nombre: item.producto,
                cantidad: item.cantidad,
                subtotal: item.subtotal,
                precio: item.precio
            })),
            usuario: {
                id: res[0].usuario_id,
                nombre: res[0].nombre_usuario,
                telefono: res[0].telefono
            }
        };

        await connection.end();
        return pedido;
    }

    static async crearPedido({ usuario_id, nombre_contacto, telefono_contacto, email_contacto, tipo_entrega, metodo_pago, direccion_calle, direccion_ciudad, direccion_codigo_postal, direccion_telefono, total, estado, productos, numero_pedido }) {
        if (!tipo_entrega || !metodo_pago || !total || !estado || !productos || productos.length === 0) {
            throw new Error("Faltan datos para crear un pedido");
        }

        const uuid = randomUUID();
        // Si no viene numero_pedido desde el webhook, generar uno nuevo
        const finalNumeroPedido = numero_pedido || `PED-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 999).toString().padStart(3, '0')}`;

        const validation = validatePedido({
            usuario_id, 
            tipo_entrega, 
            metodo_pago, 
            direccion_calle, 
            direccion_ciudad, 
            direccion_codigo_postal, 
            direccion_telefono, 
            total, 
            estado
        });
        
        if (!validation.success) {
            throw new Error(validation.error.message);
        }

        const connection = await mysql.createConnection(connectionString);
        
        try {
            await connection.beginTransaction();

            // Insertar el pedido con el número correcto
            await connection.query(
                `INSERT INTO pedidos (id, numero_pedido, nombre_contacto, telefono_contacto, email_contacto, usuario_id, tipo_entrega, metodo_pago, direccion_calle, direccion_ciudad, direccion_codigo_postal, direccion_telefono, total, estado) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [uuid, finalNumeroPedido, nombre_contacto || null, telefono_contacto || null, email_contacto || null, usuario_id || null, tipo_entrega, metodo_pago, direccion_calle || null, direccion_ciudad || null, direccion_codigo_postal || null, direccion_telefono || null, total, estado]
            );

            // Insertar los detalles del pedido
            for (const producto of productos) {
                const detalleId = randomUUID();
                await connection.query(
                    'INSERT INTO detalles_pedido (id, pedido_id, producto_id, cantidad, subtotal) VALUES (?, ?, ?, ?, ?)',
                    [detalleId, uuid, producto.producto_id, producto.cantidad, producto.subtotal]
                );
            }

            await connection.commit();
            await connection.end();
            
            // ENVIAR EMAIL DE CONFIRMACIÓN
            try {
                // Determinar email y nombre del destinatario
                let recipientEmail, recipientName;
                
                if (usuario_id) {
                    // Usuario registrado
                    const user = await UserModel.getById({ id: usuario_id });
                    recipientEmail = user?.email;
                    recipientName = user?.nombre || 'Cliente';
                } else {
                    // Usuario anónimo
                    recipientEmail = email_contacto;
                    recipientName = nombre_contacto || 'Cliente';
                }

                if (recipientEmail) {
                    // Preparar dirección de entrega
                    let direccionEntrega = '';
                    if (tipo_entrega === 'domicilio') {
                        const partes = [direccion_calle, direccion_ciudad, direccion_codigo_postal].filter(Boolean);
                        direccionEntrega = partes.join(', ');
                    }

                    // Enviar email de confirmación
                    await EmailService.sendEmail({
                        to: recipientEmail,
                        toName: recipientName,
                        subject: 'pedido',
                        data: {
                            numeroPedido: finalNumeroPedido,
                            productos: productos,
                            total: total,
                            tipoEntrega: tipo_entrega,
                            direccionEntrega: direccionEntrega
                        }
                    });

                    console.log(`Email de confirmación enviado a ${recipientEmail} para pedido ${finalNumeroPedido}`);
                } else {
                    console.log(`No se pudo enviar email para pedido ${finalNumeroPedido} - email no disponible`);
                }
            } catch (emailError) {
                console.error(`Error enviando email de confirmación para pedido ${finalNumeroPedido}:`, emailError);
                // No lanzamos error aquí para no fallar la creación del pedido
            }
            
            
            return { 
                message: "Pedido creado correctamente",
                pedido: {
                    pedido_id: uuid,
                    numero_pedido: finalNumeroPedido,
                    tipo_entrega,
                    metodo_pago,
                    estado,
                    total: total.toString(),
                    productos: productos.map(p => ({
                        ...p,
                        subtotal: p.subtotal.toString()
                    })),
                    usuario: {
                        id: usuario_id,
                        nombre: ''
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
                COALESCE(p.nombre_contacto, u.nombre, 'Cliente anónimo') AS nombre_usuario,
                COALESCE(p.telefono_contacto, u.telefono, p.direccion_telefono) AS telefono,
                p.tipo_entrega,
                p.metodo_pago,
                CASE 
                    WHEN p.tipo_entrega = 'domicilio' THEN CONCAT(p.direccion_calle, ', ', p.direccion_ciudad, ' ', p.direccion_codigo_postal)
                    ELSE 'Recogida en tienda'
                END AS direccion_entrega,
                p.estado, 
                p.total,
                p.fecha_creacion,
                p.usuario_id, 
                pr.nombre AS producto, 
                pr.precio, 
                dp.cantidad, 
                dp.subtotal 
            FROM pedidos p 
            LEFT JOIN usuarios u ON p.usuario_id = u.id
            JOIN detalles_pedido dp ON p.id = dp.pedido_id 
            JOIN productos pr ON dp.producto_id = pr.id 
            WHERE u.nombre LIKE ? OR p.direccion_telefono LIKE ? OR p.nombre_contacto LIKE ? OR p.telefono_contacto LIKE ?
            ORDER BY p.fecha_creacion DESC, p.numero_pedido;`,
            [`%${username}%`, `%${username}%`, `%${username}%`, `%${username}%`]
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
                    tipo_entrega: item.tipo_entrega,
                    metodo_pago: item.metodo_pago,
                    direccion_entrega: item.direccion_entrega,
                    fecha_creacion: item.fecha_creacion,
                    productos: [],
                    usuario:{
                        nombre: '',
                        telefono: '',
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
                    telefono: item.telefono,
                    id: item.usuario_id
                }
            ;
        }

        await connection.end();
        return pedidosAgrupados;
    }

    static async crearPedidoWithUser({ usuario_id, tipo_entrega, metodo_pago, direccion_calle, direccion_ciudad, direccion_codigo_postal, total, estado, productos }) {
        if (!usuario_id || !tipo_entrega || !metodo_pago || !total || !estado || !productos || productos.length === 0) {
            throw new Error("Faltan datos para crear un pedido con usuario");
        }

        // Obtener información del usuario
        const user = await UserModel.getById({ id: usuario_id });
        if (!user) {
            throw new Error("Usuario no encontrado");
        }

        const uuid = randomUUID();
        const numero_pedido = `PED-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 999).toString().padStart(3, '0')}`;

        const validation = validatePedido({
            usuario_id, 
            tipo_entrega, 
            metodo_pago, 
            direccion_calle, 
            direccion_ciudad, 
            direccion_codigo_postal, 
            direccion_telefono: user.telefono || '', 
            total, 
            estado
        });
        
        if (!validation.success) {
            throw new Error(validation.error.message);
        }

        const connection = await mysql.createConnection(connectionString);
        
        try {
            await connection.beginTransaction();

            // Insertar el pedido usando la información del usuario autenticado
            await connection.query(
                `INSERT INTO pedidos (id, numero_pedido, usuario_id, tipo_entrega, metodo_pago, direccion_calle, direccion_ciudad, direccion_codigo_postal, direccion_telefono, total, estado) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [uuid, numero_pedido, usuario_id, tipo_entrega, metodo_pago, direccion_calle || null, direccion_ciudad || null, direccion_codigo_postal || null, user.telefono || '', total, estado]
            );

            // Insertar los detalles del pedido
            for (const producto of productos) {
                const detalleId = randomUUID();
                await connection.query(
                    'INSERT INTO detalles_pedido (id, pedido_id, producto_id, cantidad, subtotal) VALUES (?, ?, ?, ?, ?)',
                    [detalleId, uuid, producto.producto_id, producto.cantidad, producto.subtotal]
                );
            }

            await connection.commit();
            await connection.end();
            
            // ENVIAR EMAIL DE CONFIRMACIÓN
            try {
                if (user.email) {
                    // Preparar dirección de entrega
                    let direccionEntrega = '';
                    if (tipo_entrega === 'domicilio') {
                        const partes = [direccion_calle, direccion_ciudad, direccion_codigo_postal].filter(Boolean);
                        direccionEntrega = partes.join(', ');
                    }

                    // Enviar email de confirmación
                    await EmailService.sendEmail({
                        to: user.email,
                        toName: user.nombre || 'Cliente',
                        subject: 'pedido',
                        data: {
                            numeroPedido: numero_pedido,
                            productos: productos,
                            total: total,
                            tipoEntrega: tipo_entrega,
                            direccionEntrega: direccionEntrega
                        }
                    });

                    console.log(`Email de confirmación enviado a ${user.email} para pedido ${numero_pedido}`);
                } else {
                    console.log(`No se pudo enviar email para pedido ${numero_pedido} - usuario sin email`);
                }
            } catch (emailError) {
                console.error(`Error enviando email de confirmación para pedido ${numero_pedido}:`, emailError);
                // No lanzamos error aquí para no fallar la creación del pedido
            }
            
            return { 
                message: "Pedido creado correctamente",
                pedido: {
                    pedido_id: uuid,
                    numero_pedido: numero_pedido,
                    tipo_entrega,
                    metodo_pago,
                    estado,
                    total: total.toString(),
                    productos: productos.map(p => ({
                        ...p,
                        subtotal: p.subtotal.toString()
                    })),
                    usuario: {
                        id: usuario_id,
                        nombre: user.nombre || '',
                        telefono: user.telefono || ''
                    }
                }
            };
        } catch (error) {
            await connection.rollback();
            await connection.end();
            throw error;
        }
    }
}