import mysql from 'mysql2/promise';
import { validateProduct, validatePartialProduct } from '../../../schemas/product.js';
import { randomUUID } from 'crypto';
import { DEFAULT_MYSQL_CONECTION } from '../../../config.js';
import { ImageModel } from '../../models/data/imagesModel.js';

const connectionString = process.env.DATABASE_URL ?? DEFAULT_MYSQL_CONECTION;

export class ProductModel {
  static async getAll() {
    const connection = await mysql.createConnection(connectionString);
    const [res] = await connection.query(
      'SELECT p.*, cp.nombre AS categoria_nombre FROM productos p LEFT JOIN categorias_producto cp ON p.categoria_id = cp.id'
    );

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
        cp.nombre AS categoria_nombre,
        JSON_ARRAYAGG(i.filename) AS imagens
      FROM 
        productos p
      LEFT JOIN 
        imagenes_productos i ON p.id = i.producto_id
      LEFT JOIN
        categorias_producto cp ON p.categoria_id = cp.id
      GROUP BY 
        p.id, p.nombre, p.descripcion, p.precio, p.disponible, cp.nombre;`);

    
    await connection.end();
    return res;
  }

  static async getById({ id }) {
    if (!id) throw new Error("El ID es requerido");

    const connection = await mysql.createConnection(connectionString);
    const [res] = await connection.query(`
      SELECT 
        p.id AS producto_id,
        p.nombre,
        p.descripcion,
        FORMAT(p.precio, 2) AS precio,
        p.disponible,
        cp.nombre AS categoria_nombre,
        JSON_ARRAYAGG(i.filename) AS imagens
      FROM 
        productos p
      LEFT JOIN 
        imagenes_productos i ON p.id = i.producto_id
      LEFT JOIN
        categorias_producto cp ON p.categoria_id = cp.id
      WHERE 
        p.id = ?
      GROUP BY 
        p.id, p.nombre, p.descripcion, p.precio, p.disponible, cp.nombre`, [id]);

    await connection.end();
    return res[0];
  }

  static async getByNombre({ nombre }) {
    if (!nombre) throw new Error("El nombre es requerido");

    const connection = await mysql.createConnection(connectionString);
    const [res] = await connection.query(`
      SELECT 
        p.id AS producto_id,
        p.nombre,
        p.descripcion,
        FORMAT(p.precio, 2) AS precio,
        p.disponible,
        cp.nombre AS categoria_nombre,
        JSON_ARRAYAGG(i.filename) AS imagens
      FROM 
        productos p
      LEFT JOIN 
        imagenes_productos i ON p.id = i.producto_id
      LEFT JOIN
        categorias_producto cp ON p.categoria_id = cp.id
      WHERE 
        p.nombre = ?
      GROUP BY 
        p.id, p.nombre, p.descripcion, p.precio, p.disponible, cp.nombre`, [nombre]);

    await connection.end();
    console.log(res);
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

  static async crearProducto({ nombre, descripcion, precio, disponible, imagenes, categoria_id }) {
    try {
      console.log(nombre, descripcion, precio, disponible, imagenes, categoria_id);
      if (!nombre || !descripcion || !precio || disponible === undefined || !categoria_id) {
        throw new Error("Faltan datos para crear un producto, incluyendo categoria_id");
      }

      precio = Number(precio);
      const disponibleValue = disponible === 'true' || disponible === true ? true : false;
      // Asegúrate de que categoria_id también se valida si es necesario. Momentáneamente, asumimos que es un UUID válido.
      const validation = validateProduct({ nombre, descripcion, precio, disponible: disponibleValue, categoria_id });
      if (!validation.success) {
        // Adaptar el mensaje de error si la validación de categoria_id falla
        throw new Error(validation.error.errors.map(e => e.message).join(', '));
      }

      const uuid = randomUUID();
      const disponibleValueDB = disponibleValue; // Ya es booleano
      
      const imageFilenames = imagenes.map(image => image.filename);

      const connection = await mysql.createConnection(connectionString);
      await connection.beginTransaction(); // Iniciar transacción

      try {
        await connection.query(
          'INSERT INTO productos (id, nombre, descripcion, precio, disponible, categoria_id) VALUES (?, ?, ?, ?, ?, ?)',
          [uuid, nombre, descripcion, precio, disponibleValueDB, categoria_id]
        );

        for (const filename of imageFilenames) {
          await connection.query(
            'INSERT INTO imagenes_productos (producto_id, filename) VALUES (?, ?)',
            [uuid, filename]
          );
        }
        await connection.commit(); // Confirmar transacción
        return({ message: "Producto creado correctamente", id: uuid });
      } catch (error) {
        await connection.rollback(); // Revertir en caso de error
        throw error; // Re-lanzar el error para manejo externo
      } finally {
        await connection.end();
      }
    } catch (error) {
      // Asegurarse de que el mensaje de error sea informativo
      return ({ error: `Error al crear producto: ${error.message}` });
    }
  }

  static async actualizarProducto({ id, nombre, descripcion, precio, disponible, imagenes, categoria_id }) {
    if (!id) throw new Error("El ID es requerido");

    const updates = [];
    const values = {};

    if (nombre) { updates.push("nombre = ?"); values.nombre = nombre; }
    if (descripcion) { updates.push("descripcion = ?"); values.descripcion = descripcion; }
    if (precio) { updates.push("precio = ?"); values.precio = Number(precio); }
    if (disponible !== undefined) { updates.push("disponible = ?"); values.disponible = disponible === 'true' || disponible === true; }
    if (categoria_id) { updates.push("categoria_id = ?"); values.categoria_id = categoria_id; }
    
    if (updates.length === 0 && (!imagenes || imagenes.length === 0)) {
      throw new Error("No hay datos para actualizar");
    }
    
    // Validar solo los campos que se van a actualizar
    const partialDataToValidate = { ...values };
    // La validación parcial podría necesitar ajustarse para manejar campos opcionales correctamente.
    // Si `validatePartialProduct` espera todos los campos potencialmente actualizables,
    // entonces no es necesario eliminar `categoria_id` si no está presente.
    // Si `categoria_id` no está en `values` porque no se actualiza, no se incluirá en la validación.
    
    // Eliminar `categoria_id` de `partialDataToValidate` si no se está actualizando,
    // para evitar problemas con `validatePartialProduct` si no espera `categoria_id`.
    // Sin embargo, si `validatePartialProduct` está diseñado para ignorar campos no presentes, esta línea no es necesaria.
    // Comentado por ahora, ya que dependerá de la implementación de `validatePartialProduct`.
    // if (!values.categoria_id) delete partialDataToValidate.categoria_id;


    // Solo validar si hay algo que validar en `values`
    if (Object.keys(values).length > 0) {
      const validationResult = validatePartialProduct(values); // Usar 'values' que contiene los campos a actualizar
      if (!validationResult.success) {
        throw new Error(validationResult.error.errors.map(e => e.message).join(', '));
      }
    }


    try {
      const connection = await mysql.createConnection(connectionString);
      await connection.beginTransaction();

      try {
        if (updates.length > 0) {
          const query = `UPDATE productos SET \${updates.join(", ")} WHERE id = ?`;
          const queryValues = [...Object.values(values), id];
          await connection.query(query, queryValues);
        }

        if (imagenes && imagenes.length > 0) {
          for (const image of imagenes) {
            await connection.query(
              'INSERT INTO imagenes_productos (producto_id, filename) VALUES (?, ?)',
              [id, image.filename]
            );
          }
        }

        await connection.commit();
        return { message: "Producto actualizado correctamente" };
      } catch (error) {
        await connection.rollback();
        throw error; 
      } finally {
        await connection.end();
      }
    } catch (error) {
      // Es mejor relanzar el error para que el controlador lo maneje
      throw error; // O retornar un objeto de error: return { error: `Error al actualizar producto: ${error.message}` };
    }
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

  static async deleteProductImage({ productId, filename }) {
    if (!productId || !filename) {
      throw new Error("Se requiere el ID del producto y el nombre del archivo");
    }

    const connection = await mysql.createConnection(connectionString);
    await connection.beginTransaction();

    try {
      // First check if the image exists in the database
      const [imageExists] = await connection.query(
        'SELECT filename FROM imagenes_productos WHERE producto_id = ? AND filename = ?',
        [productId, filename]
      );

      if (imageExists.length === 0) {
        throw new Error("La imagen no existe en la base de datos");
      }

      // Delete the image record from database first
      await connection.query(
        'DELETE FROM imagenes_productos WHERE producto_id = ? AND filename = ?',
        [productId, filename]
      );

      // Then try to delete the physical file
      try {
        await ImageModel.deleteImage({ name: filename });
      } catch (fileError) {
        // Log the error but don't fail the transaction if file is already gone
        console.error('Error deleting physical file:', fileError);
      }

      await connection.commit();
      await connection.end();
      return { message: "Imagen eliminada correctamente" };
    } catch (error) {
      await connection.rollback();
      await connection.end();
      throw error;
    }
  }

  static async getProductsGroupedByCategoryWithImages() {
    const connection = await mysql.createConnection(connectionString);
    try {
      const [rows] = await connection.query(`
        SELECT
          p.id AS producto_id,
          p.nombre,
          p.descripcion,
          FORMAT(p.precio, 2) AS precio,
          p.disponible,
          p.categoria_id,
          cp.nombre AS categoria_nombre,
          (SELECT JSON_ARRAYAGG(i.filename) FROM imagenes_productos i WHERE i.producto_id = p.id) AS imagens
        FROM
          productos p
        LEFT JOIN
          categorias_producto cp ON p.categoria_id = cp.id
        ORDER BY
          cp.nombre, p.nombre;
      `);

      const groupedProducts = {};
      for (const row of rows) {
        
        // Ensure 'imagens' is an array and handle cases where it might be null or contain a single null from DB
        if (row.imagens === null || (Array.isArray(row.imagens) && row.imagens.length === 1 && row.imagens[0] === null)) {
          row.imagens = []; 
        } else if (!Array.isArray(row.imagens)) {
          // Fallback if it's somehow not an array and not null (e.g., unexpected string)
          row.imagens = [];
        }
        
        const categoryName = row.categoria_nombre || 'Otros'; // Default to 'Otros' if no category
        if (!groupedProducts[categoryName]) {
          groupedProducts[categoryName] = [];
        }
        // Create a new object for the product to avoid modifying the original row directly if it's used elsewhere
        const productData = {
          producto_id: row.producto_id,
          nombre: row.nombre,
          descripcion: row.descripcion,
          precio: row.precio,
          disponible: row.disponible,
          categoria_id: row.categoria_id, // Keep categoria_id if needed within the product object
          imagens: row.imagens
        };
        groupedProducts[categoryName].push(productData);
      }
      return groupedProducts;
    } finally {
      await connection.end();
    }
  }
}
