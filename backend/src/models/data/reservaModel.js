import mysql from 'mysql2/promise'
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { DEFAULT_MYSQL_CONECTION, SALT_ROUNDS } from '../../../config.js'
import { date } from 'zod';

const connectionString = process.env.DATABASE_URL ?? DEFAULT_MYSQL_CONECTION

export class ReservaModel {
    static async getAll() {
        const connection = await mysql.createConnection(connectionString);
        const [res] = await connection.query('SELECT * FROM reservas');

        await connection.end();
        return res;
    }

    static async getById({ id }) {
        if (!id) {
            throw new Error("El ID es undefined o null");
        }

        const connection = await mysql.createConnection(connectionString);
        const res = await connection.query(
            `SELECT * FROM reservas WHERE id = ?`,
            [id]
        );

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

    //POST reservation 
    static async createReservation({ usuario_id, fecha, hora, personas }) {
        if (!usuario_id || !fecha || !hora || !personas) {
          throw new Error("Faltan datos para crear la reserva");
        }
    
        const connection = await mysql.createConnection(connectionString);
        const estado = 'confirmada';

        try {
            //Comprobar si hay mesas disponibles
          const [mesas] = await connection.execute(
                `SELECT id FROM mesas 
                WHERE capacidad >= ? 
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
          // Crear la reserva
          const [result] = await connection.execute(
            `INSERT INTO reservas (id, usuario_id, mesa_id, fecha, hora, estado, personas) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, usuario_id, mesa_id, fecha, hora, estado, personas]
          );

          await connection.end();
          return { mensaje: "Reserva confirmada" };

        } catch (error) {
          console.error("Error");
          throw new Error("Error en la base de datos");
        }
    }

    //Post verification of a possible reservation
    /* static async checkReservation({ fecha, hora, personas }) {
        if (!fecha || !hora  || !personas) {
            throw new Error("Faltan datos para verificar la reserva");
        }
      
        const connection = await mysql.createConnection(connectionString);

        
        connection.query(
            `SELECT m.id FROM mesas m 
             WHERE m.capacidad >= ? 
             AND m.id NOT IN (
                SELECT r.mesa_id FROM reservas r 
                WHERE r.fecha = ? AND r.hora = ? AND r.estado IN ('pendiente', 'confirmada')
             ) 
             LIMIT 1`,
            [personas, fecha, hora],
            (err, results) => {
                if (err) return ({ message: err.message });
    
                if (results.length === 0) {
                    return res.json({ mensaje: "No hay mesas disponibles a esa hora." });
                }
    
                return ({ disponible: true, mesa_id: results[0].id });
            }
        );
    } */
    
    //Update reservation
    static async updateReservation({ reserva_id, estado, date, hour, personas }) {
        if (!reserva_id) {
          throw new Error("Se requiere el ID de la reserva");
        }
    
        const connection = await mysql.createConnection(connectionString);
    
        try {
          // Obtener la reserva actual
          const [reservas] = await connection.execute(
            `SELECT mesa_id, personas, fecha, hora FROM reservas WHERE id = ?`,
            [reserva_id]
          );
    
          if (reservas.length === 0) {
            return { success: false, mensaje: "Reserva no encontrada" };
          }
    
          let { mesa_id, personas: oldPersonas, fecha: oldDate, hora: oldHour } = reservas[0];
          let newMesaId = mesa_id; // Mantener la mesa actual si es válida
    
          // Si cambia el número de personas, verificar la mesa actual
          if (personas && personas !== oldPersonas) {
            const [mesas] = await connection.execute(
              `SELECT id FROM mesas 
               WHERE capacidad >= ? 
               AND id NOT IN (
                  SELECT mesa_id FROM reservas 
                  WHERE fecha = ? AND hora = ? AND estado IN ('pendiente', 'confirmada')
               ) 
               LIMIT 1`,
              [personas, date || oldDate, hour || oldHour]
            );
    
            if (mesas.length === 0) {
              return { success: false, mensaje: "No hay mesas disponibles para la nueva cantidad de personas" };
            }
    
            newMesaId = mesas[0].id;
          }
    
          // Actualizar la reserva con los valores nuevos
          await connection.execute(
            `UPDATE reservas 
             SET estado = COALESCE(?, estado), 
                 fecha = COALESCE(?, fecha), 
                 hora = COALESCE(?, hora), 
                 personas = COALESCE(?, personas), 
                 mesa_id = ? 
             WHERE id = ?`,
            [estado, date, hour, personas, newMesaId, reserva_id]
          );
    
          await connection.end();
          return { success: true, mensaje: "Reserva actualizada correctamente" };
    
        } catch (error) {
          console.error("Error al actualizar la reserva:", error);
          throw new Error("Error en la base de datos");
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
        return ({ mensaje: "Reserva eliminada" });
    }

}