import mysql from 'mysql2/promise'
import { randomUUID } from 'crypto';
import { DEFAULT_MYSQL_CONECTION } from '../../../config.js'
import { validateReserva, validatePartialReserva } from '../../../schemas/reserva.js'
import { EmailService } from '../../services/email.service.js';
import { UserModel } from './userModel.js';

const connectionString = process.env.DATABASE_URL ?? DEFAULT_MYSQL_CONECTION

export class ReservaModel {
    static async getAll() {
        const connection = await mysql.createConnection(connectionString);
        const [res] = await connection.query(`
            SELECT 
                r.id AS reserva_id,
                u.nombre AS nombre_usuario,
                u.telefono,
                m.numero AS numero_mesa,
                DATE_FORMAT(r.fecha, '%Y-%m-%d') as fecha,
                r.hora,
                r.estado,
                r.personas
            FROM reservas r
            JOIN usuarios u ON r.usuario_id = u.id
            JOIN mesas m ON r.mesa_id = m.id
            ORDER BY r.fecha, r.hora;
        `);

        await connection.end();
        return res;
    }

    static async getById({ id }) {
        if (!id) {
            throw new Error("El ID es undefined o null");
        }

        const connection = await mysql.createConnection(connectionString);
        const [res] = await connection.query(`
            SELECT 
                r.id AS reserva_id,
                u.nombre AS nombre_usuario,
                u.telefono,
                m.numero AS numero_mesa,
                DATE_FORMAT(r.fecha, '%Y-%m-%d') as fecha,
                r.hora,
                r.estado,
                r.personas
            FROM reservas r
            JOIN usuarios u ON r.usuario_id = u.id
            JOIN mesas m ON r.mesa_id = m.id
            WHERE r.id = ?
        `, [id]);

        await connection.end();
        return res[0];
    }

    //Get reservation by user
    static async getReservationByUser({ id }) {
        if (!id) {
            throw new Error("El ID es undefined o null");
        }

        const connection = await mysql.createConnection(connectionString);
        const res = await connection.query(
            `SELECT * FROM reservas WHERE usuario_id = ?`,
            [id]
        );

        await connection.end();
        return res[0];
    }

    //Get reservation by table
    static async getReservationByTable({ id }) {
        if (!id) {
            throw new Error("El ID es undefined o null");
        }

        const connection = await mysql.createConnection(connectionString);
        const res = await connection.query(
            `SELECT * FROM reservas WHERE mesa_id = ?`,
            [id]
        );

        await connection.end();
        return res[0];
    }

    //Get reservation by date
    static async getReservationByDate({ date }) {
        if (!date) {
            throw new Error("La fecha es undefined o null");
        }

        const connection = await mysql.createConnection(connectionString);
        const res = await connection.query(
            `SELECT * FROM reservas WHERE DATE(fecha) = ?`,
            [date]
        );

        await connection.end();
        return res[0];
    }

    //POST reservation with existing user ID
    static async createReservationWithUserId({ usuario_id, fecha, hora, personas }) {
        if (!usuario_id || !fecha || !hora || !personas) {
            throw new Error("Faltan datos para crear la reserva");
        }

        const connection = await mysql.createConnection(connectionString);
        const estado = 'confirmada';

        try {
            //Comprobar si hay mesas disponibles
            const [mesas] = await connection.execute(
                `SELECT id FROM mesas 
                WHERE (capacidad+1) >= ? 
                AND id NOT IN (
                    SELECT mesa_id FROM reservas 
                    WHERE fecha = ? AND hora = ? AND estado IN ('pendiente', 'confirmada')
                ) 
                LIMIT 1`,
                [personas, fecha, hora]
            );

            if (mesas.length === 0) {
                return { mensaje: "No hay mesas disponibles a esa hora y ese dia." };
            }

            const mesa_id = mesas[0].id;
            const id = randomUUID();

            const validation = validateReserva({ usuario_id, mesa_id, fecha, hora, estado, personas });
            if(!validation.success){
                throw new Error(validation.error.message);
            }

            // Crear la reserva
            const [result] = await connection.execute(
                `INSERT INTO reservas (id, usuario_id, mesa_id, fecha, hora, estado, personas) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [id, usuario_id, mesa_id, fecha, hora, estado, personas]
            );

            // Obtener información de la mesa asignada
            const [mesaInfo] = await connection.execute(
                `SELECT numero FROM mesas WHERE id = ?`,
                [mesa_id]
            );

            await connection.end();
            
            // ENVIAR EMAIL DE CONFIRMACIÓN
            try {
                // Obtener información del usuario
                const user = await UserModel.getById({ id: usuario_id });
                
                if (user && user.email) {
                    // Enviar email de confirmación
                    await EmailService.sendEmail({
                        to: user.email,
                        toName: user.nombre || 'Cliente',
                        subject: 'reserva',
                        data: {
                            fecha: fecha,
                            hora: hora.substring(0, 5), // Formato HH:MM
                            personas: personas,
                            numeroMesa: mesaInfo[0]?.numero
                        }
                    });

                    console.log(`Email de confirmación de reserva enviado a ${user.email}`);
                } else {
                    console.log(`No se pudo enviar email de reserva para usuario ${usuario_id} - email no disponible`);
                }
            } catch (emailError) {
                console.error(`Error enviando email de confirmación de reserva:`, emailError);
                // No lanzamos error aquí para no fallar la creación de la reserva
            }
            
            return { message: "Reserva creada correctamente" };

        } catch (error) {
            console.error("Error " + error);
            throw new Error("Error en la base de datos: " + error.message);
        }
    }

    //POST reservation 
    static async createReservation({ nombre, telefono, fecha, hora, personas }) {
        if (!nombre || !telefono || !fecha || !hora || !personas) {
          throw new Error("Faltan datos para crear la reserva");
        }
    
        const connection = await mysql.createConnection(connectionString);
        const estado = 'confirmada';

        try {
            // Crear un usuario temporal con el nombre y teléfono
            const usuario_id = randomUUID();
            await connection.execute(
                `INSERT INTO usuarios (id, nombre, telefono, email, password, rol) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [usuario_id, nombre, telefono, `temp_${usuario_id}@reserva.com`, 'temp_password', 'cliente']
            );

            //Comprobar si hay mesas disponibles
          const [mesas] = await connection.execute(
                `SELECT id FROM mesas 
                WHERE (capacidad+1) >= ? 
                AND id NOT IN (
                    SELECT mesa_id FROM reservas 
                    WHERE fecha = ? AND hora = ? AND estado IN ('pendiente', 'confirmada')
                ) 
                LIMIT 1`,
                [personas, fecha, hora]
            );
    
          if (mesas.length === 0) {
            return { mensaje: "No hay mesas disponibles a esa hora y ese dia." };
          }
    
          const mesa_id = mesas[0].id;
    
          const id = randomUUID();

          const validation = validateReserva({ usuario_id, mesa_id, fecha, hora, estado, personas });
          if(!validation.success){
            throw new Error(validation.error.message);
          }

          // Crear la reserva
          const [result] = await connection.execute(
            `INSERT INTO reservas (id, usuario_id, mesa_id, fecha, hora, estado, personas) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, usuario_id, mesa_id, fecha, hora, estado, personas]
          );

          // Obtener información de la mesa asignada
          const [mesaInfo] = await connection.execute(
              `SELECT numero FROM mesas WHERE id = ?`,
              [mesa_id]
          );

          await connection.end();
          
          try {
              console.log(`Reserva creada para usuario anónimo: ${nombre} - ${telefono}`);
              console.log(`Mesa asignada: ${mesaInfo[0]?.numero || 'N/A'}`);
              
          } catch (emailError) {
              console.error(`Error en proceso de email para reserva anónima:`, emailError);
          }
          
          return { message: "Reserva confirmada" };

        } catch (error) {
          console.error("Error " + error);
          throw new Error("Error en la base de datos"+ error.message);
        }
    }

    //Post verification of a possible reservation
    static async checkReservation({ fecha, hora, personas }) {
        if (!fecha || !hora || !personas) {
            throw new Error("Faltan datos para verificar la reserva");
        }
      
        const connection = await mysql.createConnection(connectionString);

        try {
            // Verificar si hay mesas disponibles para la fecha y hora solicitada
            const [mesasDisponibles] = await connection.execute(
                `SELECT id FROM mesas 
                 WHERE (capacidad +1) >= ? 
                 AND id NOT IN (
                    SELECT mesa_id FROM reservas 
                    WHERE fecha = ? AND hora = ? AND estado IN ('pendiente', 'confirmada')
                 ) 
                 LIMIT 1`,
                [personas, fecha, hora]
            );

            if (mesasDisponibles.length > 0) {
                await connection.end();
                return { 
                    disponible: true, 
                    mensaje: "Mesa disponible para la fecha y hora solicitada",
                    mesa_id: mesasDisponibles[0].id 
                };
            }

            // Si no hay mesas disponibles, buscar horarios alternativos para ese día
            const [horariosAlternativos] = await connection.execute(
                `SELECT DISTINCT r.hora 
                 FROM (
                    SELECT DISTINCT '12:00:00' as hora
                    UNION SELECT '12:30:00' as hora
                    UNION SELECT '13:00:00' as hora  
                    UNION SELECT '13:30:00' as hora
                    UNION SELECT '14:00:00' as hora
                    UNION SELECT '14:30:00' as hora
                    UNION SELECT '15:00:00' as hora
                    UNION SELECT '20:00:00' as hora
                    UNION SELECT '20:30:00' as hora
                    UNION SELECT '21:00:00' as hora
                    UNION SELECT '21:30:00' as hora
                    UNION SELECT '22:00:00' as hora
                    UNION SELECT '22:30:00' as hora
                    UNION SELECT '23:00:00' as hora
                 ) r
                 WHERE EXISTS (
                    SELECT 1 FROM mesas m 
                    WHERE m.capacidad >= ? 
                    AND m.id NOT IN (
                        SELECT mesa_id FROM reservas 
                        WHERE fecha = ? AND hora = r.hora AND estado IN ('pendiente', 'confirmada')
                    )
                 )
                 ORDER BY r.hora`,
                [personas, fecha]
            );

            await connection.end();

            return { 
                disponible: false, 
                mensaje: "No hay mesas disponibles a esa hora",
                horariosAlternativos: horariosAlternativos.map(h => h.hora.substring(0, 5)) // Formato HH:MM
            };

        } catch (error) {
            await connection.end();
            throw new Error("Error en la base de datos: " + error.message);
        }
    }
    
    //Update reservation
    static async updateReservation({ id, estado, date, hour, personas }) {
      if (!id) {
          throw new Error("Se requiere el ID de la reserva");
      }
  
      const connection = await mysql.createConnection(connectionString);
  
      try {
          // Obtener la reserva actual
          const [reservas] = await connection.execute(
              `SELECT mesa_id, personas, fecha, hora FROM reservas WHERE id = ?`,
              [id]
          );
  
          if (reservas.length === 0) {
              return { success: false, mensaje: "Reserva no encontrada" };
          }
  
          let { mesa_id, personas: oldPersonas, fecha: oldDate, hora: oldHour } = reservas[0];
          let newMesaId = mesa_id; // Mantener la mesa actual si es válida
  
          // Solo procesar la fecha si se proporciona
          if (date) {
              date = date.split('T')[0]; 
          }
          
          // Si cambia el número de personas, verificar la mesa actual
          if (personas && personas !== oldPersonas) {
              const [mesas] = await connection.execute(
                  `SELECT id FROM mesas 
                   WHERE capacidad >= ? 
                   AND id NOT IN (
                      SELECT mesa_id FROM reservas 
                      WHERE DATE(fecha) = DATE(?) AND hora = ? AND estado IN ('pendiente', 'confirmada')
                   ) 
                   LIMIT 1`,
                  [personas, date || oldDate, hour || oldHour]
              );
  
              if (mesas.length === 0) {
                  return { success: false, message: "No hay mesas disponibles para la nueva cantidad de personas" };
              }
  
              newMesaId = mesas[0].id;
          }
  
          const updates = [];
          const values = {};
  
          if (estado) updates.push("estado = ?"), values.estado = estado;
          if (date) updates.push("fecha = ?"), values.fecha = date;
          if (hour) updates.push("hora = ?"), values.hora = hour;
          if (personas) updates.push("personas = ?"), values.personas = personas;
          if (newMesaId !== mesa_id) updates.push("mesa_id = ?"), values.mesa_id = newMesaId;
          
          if (!updates.length) throw new Error("No hay datos para actualizar");
  
          const validation = validatePartialReserva(values);
          if (!validation.success) {
              throw new Error(validation.error.message);
          }
  
          const query = `UPDATE reservas SET ${updates.join(", ")} WHERE id = ?`;
          const queryValues = [...Object.values(values), id];
          await connection.query(query, queryValues);
          await connection.end();
  
          return { success: true, message: "Reserva actualizada correctamente" };
  
      } catch (error) {
          console.error("Error al actualizar la reserva:", error);
          throw new Error(`Error al actualizar la reserva: ${error.message}`);
      }
  }
  

    static async deleteReservation({ id }) {
        if (!id) {
            throw new Error("El ID es undefined o null");
        }

        const connection = await mysql.createConnection(connectionString);
        const res = await connection.execute(
            `DELETE FROM reservas WHERE id = ?`,
            [id]
        );

        await connection.end();
        return ({ message: "Reserva eliminada" });
    }

}