
import mysql from 'mysql2/promise';
import { validateMesa, validatePartialMesa } from '../../../schemas/table.js';
import { randomUUID } from 'crypto';
import { DEFAULT_MYSQL_CONECTION } from '../../../config.js';

const connectionString = process.env.DATABASE_URL ?? DEFAULT_MYSQL_CONECTION;

export class MesaModel {
    static async getAll() {
        const connection = await mysql.createConnection(connectionString);
        const [res] = await connection.query('SELECT * FROM mesas');
        await connection.end();
        return res;
    }

    static async getById({ id }) {
        if (!id) throw new Error("El ID es requerido");
        const connection = await mysql.createConnection(connectionString);
        const [res] = await connection.query('SELECT * FROM mesas WHERE id = ?', [id]);
        await connection.end();
        return res[0];
    }

    static async crearMesa({ numero, capacidad }) {
        if (!numero || !capacidad) {
            throw new Error("Faltan datos para crear una mesa");
        }

        const validation = validateMesa({ numero, capacidad });
        if (!validation.success) {
            throw new Error(validation.error.message);
        }

        const uuid = randomUUID();
        const connection = await mysql.createConnection(connectionString);
        await connection.query('INSERT INTO mesas (id, numero, capacidad) VALUES (?, ?, ?)',
            [uuid, numero, capacidad]);
        await connection.end();
        return { message: "Mesa creada correctamente" };
    }

    static async actualizarMesa({ id, numero, capacidad }) {
        if (!id) throw new Error("El ID es requerido");
        const updates = [];
        const values = {};

        if (numero) updates.push("numero = ?"), values.numero = numero;
        if (capacidad) updates.push("capacidad = ?"), values.capacidad = capacidad;
        if (!updates.length) throw new Error("No hay datos para actualizar");

        const validation = validatePartialMesa(values);
        if (!validation.success) {
            throw new Error(validation.error.message);
        }

        const connection = await mysql.createConnection(connectionString);
        const query = `UPDATE mesas SET ${updates.join(", ")} WHERE id = ?`;
        const queryValues = [...Object.values(values), id];
        await connection.query(query, queryValues);
        await connection.end();
        return { message: "Mesa actualizada correctamente" };
    }

    static async eliminarMesa({ id }) {
        if (!id) throw new Error("El ID es requerido");
        const connection = await mysql.createConnection(connectionString);
        await connection.query('DELETE FROM mesas WHERE id = ?', [id]);
        await connection.end();
        return { message: "Mesa eliminada correctamente" };
    }
}
