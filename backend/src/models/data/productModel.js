
import mysql from 'mysql2/promise';
import { validateProduct, validatePartialProduct } from '../../../schemas/product.js';
import { randomUUID } from 'crypto';
import { DEFAULT_MYSQL_CONECTION } from '../../../config.js';

const connectionString = process.env.DATABASE_URL ?? DEFAULT_MYSQL_CONECTION;

export class ProductModel {
  static async getAll() {
    const connection = await mysql.createConnection(connectionString);
    const [res] = await connection.query('SELECT * FROM productos');

    await connection.end();
    return res;
  }

  static async getById({ id }) {
    if (!id) throw new Error("El ID es requerido");

    const connection = await mysql.createConnection(connectionString);
    const [res] = await connection.query('SELECT * FROM productos WHERE id = ?', [id]);

    await connection.end();
    return res[0];
  }

  static async getByNombre({ nombre }) {
    if (!nombre) throw new Error("El nombre es requerido");

    const connection = await mysql.createConnection(connectionString);
    const [res] = await connection.query('SELECT * FROM productos WHERE nombre = ?', [nombre]);

    await connection.end();
    return res;
  }

  static async getByDisponibilidad({ disponible }) {
    if(disponible === undefined) {
      throw new Error("La disponibilidad es requerida");
    }

    if(disponible === true) {
      disponible = 1;
    }else if(disponible === false) {
      disponible = 0;
    }

    const connection = await mysql.createConnection(connectionString);
    const [res] = await connection.query('SELECT * FROM productos WHERE disponible = ?', [disponible]);
    await connection.end();

    return res;
  }

  static async crearProducto({ nombre, descripcion, precio, disponible }) {
    if (!nombre || !descripcion || !precio || disponible === undefined) {
      throw new Error("Faltan datos para crear un producto");
    }

    if (!validateProduct({ nombre, descripcion, precio, disponible }).success) {
      throw new Error(validateProduct().error.message);
    }

    if(disponible === true) {
      disponible = 1;
    }else if(disponible === false) {
      disponible = 0;
    }
    const uuid = randomUUID();

    const connection = await mysql.createConnection(connectionString);
    await connection.query('INSERT INTO productos (id, nombre, descripcion, precio, disponible) VALUES (?, ?, ?, ?, ?)',
      [uuid, nombre, descripcion, precio, disponible]);

    await connection.end();
    return { message: "Producto creado correctamente" };
  }

  static async actualizarProducto({ id, nombre, descripcion, precio, disponible }) {
    if (!id) throw new Error("El ID es requerido");

    const updates = [];
    const values = {};

    if (nombre) updates.push("nombre = ?"), values.nombre = nombre;
    if (descripcion) updates.push("descripcion = ?"), values.descripcion = descripcion;
    if (precio) updates.push("precio = ?"), values.precio = precio;
    if (disponible !== undefined) updates.push("disponible = ?"), values.disponible = disponible;
    if (!updates.length) throw new Error("No hay datos para actualizar");

    if (!validatePartialProduct(values).success) throw new Error(validatePartialProduct().error.message);

    const connection = await mysql.createConnection(connectionString);
    const query = `UPDATE productos SET ${updates.join(", ")} WHERE id = ?`;
    
    const queryValues = [...Object.values(values), id];
    await connection.query(query, queryValues);

    await connection.end();
    return { message: "Producto actualizado correctamente" };
  }

  static async eliminarProducto({ id }) {
    if (!id) throw new Error("El ID es requerido");

    const connection = await mysql.createConnection(connectionString);
    await connection.query('DELETE FROM productos WHERE id = ?', [id]);

    await connection.end();
    return { message: "Producto eliminado correctamente" };
  }
}
