
import mysql from 'mysql2/promise';
import { validateProduct, validatePartialProduct } from '../../../schemas/product.js';
import { randomUUID } from 'crypto';
import { DEFAULT_MYSQL_CONECTION } from '../../../config.js';
import { uploadImages } from '../../middlewares/multer.middleware.js';

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

  static async crearProducto({ nombre, descripcion, precio, disponible, images }) {
    try {
      console.log(nombre, descripcion, precio, disponible, images);
      if (!nombre || !descripcion || !precio || disponible === undefined) {
        throw new Error("Faltan datos para crear un producto");
      }

      const validation = validateProduct({ nombre, descripcion, precio, disponible });
      if (!validation.success) {
        throw new Error(validation.error.message);
      }

      const disponibleValue = disponible === 'true' || disponible === true ? 1 : 0;
      const uuid = randomUUID();

      // Extraer nombres de archivos
      const imageFilenames = images.map(image => image.filename); // array de strings

      const connection = await mysql.createConnection(connectionString);

      // Insertar producto
      await connection.query(
        'INSERT INTO productos (id, nombre, descripcion, precio, disponible) VALUES (?, ?, ?, ?, ?)',
        [uuid, nombre, descripcion, precio, disponibleValue]
      );

      // Insertar imágenes asociadas
      for (const filename of imageFilenames) {
        await connection.query(
          'INSERT INTO imagenes_productos (producto_id, filename) VALUES (?, ?)',
          [uuid, filename]
        );
      }

      uploadImages.array('images', 10);

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
    await connection.query('DELETE FROM productos WHERE id = ?', [id]);
    await connection.query('DELETE FROM imagenes_productos WHERE producto_id = ?', [id]);

    await connection.end();
    return { message: "Producto eliminado correctamente" };
  }
}
