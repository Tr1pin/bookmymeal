import mysql from 'mysql2/promise';
import { validateProduct, validatePartialProduct } from '../../../schemas/product.js';
import { randomUUID } from 'crypto';
import { DEFAULT_MYSQL_CONECTION } from '../../../config.js';
import { ImageModel } from '../../models/data/imagesModel.js';

const connectionString = process.env.DATABASE_URL ?? DEFAULT_MYSQL_CONECTION;

export class ProductModel {
  static async getAll() {
    const connection = await mysql.createConnection(connectionString);
    const [res] = await connection.query('SELECT * FROM productos');

    await connection.end();
    return res;
  }

  static async getProductsImages() {
    const connection = await mysql.createConnection(connectionString);
    const [res] = await connection.query(`
      SELECT 
        p.id AS producto_id,
        p.nombre,
        p.descripcion,
        FORMAT(p.precio, 2) AS precio,
        p.disponible,
        JSON_ARRAYAGG(i.filename) AS imagens
      FROM 
        productos p
      LEFT JOIN 
        imagenes_productos i ON p.id = i.producto_id
      GROUP BY 
        p.id, p.nombre, p.descripcion, p.precio, p.disponible;`);

    
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

  static async crearProducto({ nombre, descripcion, precio, disponible, imagenes }) {
    try {
      console.log(nombre, descripcion, precio, disponible, imagenes);
      if (!nombre || !descripcion || !precio || disponible === undefined) {
        throw new Error("Faltan datos para crear un producto");
      }

      precio = Number(precio);
      const disponibleValue = disponible === 'true' || disponible === true ? true : false;
      console.log(typeof precio, typeof disponibleValue, typeof nombre, typeof descripcion);
      const validation = validateProduct({ nombre, descripcion, precio, disponible: disponibleValue });
      console.log(validation.success);
      if (!validation.success) {
        throw new Error(validation.error.message);
      }
      console.log("LLego aqui 2");

      const uuid = randomUUID();
      const disponibleValueDB = disponibleValue === 'true' || disponibleValue === true ? true : false;
      console.log("Llego aqui 3");
      // Extraer nombres de archivos
      const imageFilenames = imagenes.map(image => image.filename); // array de strings

      const connection = await mysql.createConnection(connectionString);
    console.log("LLego aqui 3");
      // Insertar producto
      await connection.query(
        'INSERT INTO productos (id, nombre, descripcion, precio, disponible) VALUES (?, ?, ?, ?, ?)',
        [uuid, nombre, descripcion, precio, disponibleValueDB]
      );
      // Insertar imágenes asociadas
      for (const filename of imageFilenames) {
        await connection.query(
          'INSERT INTO imagenes_productos (producto_id, filename) VALUES (?, ?)',
          [uuid, filename]
        );
      }

      await connection.end();
      return({ message: "Producto creado correctamente", id: uuid });
    } catch (error) {
      return ({ error: error.message });
    }
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

    // Get all images for the product
    const [imagesResult] = await connection.query(`
        SELECT filename
        FROM imagenes_productos
        WHERE producto_id = ?`, [id]
    );

    // Delete each image file
    for (const image of imagesResult) {
      await ImageModel.deleteImage({ name: image.filename });
    }
    
    // Delete database records
    await connection.query('DELETE FROM imagenes_productos WHERE producto_id = ?', [id]);
    await connection.query('DELETE FROM productos WHERE id = ?', [id]);

    await connection.end();
    return { message: "Producto eliminado correctamente" };
  }
}
