import mysql from 'mysql2/promise';
import { DEFAULT_MYSQL_CONECTION } from '../../../config.js';

const connectionString = process.env.DATABASE_URL ?? DEFAULT_MYSQL_CONECTION;

export class ProductCategoryModel {
  static async getAll() {
    const connection = await mysql.createConnection(connectionString);
    try {
      const [categories] = await connection.query('SELECT id, nombre FROM categorias_producto ORDER BY nombre');
      return categories;
    } finally {
      await connection.end();
    }
  }
  // Placeholder for getById if needed later
  static async getById({ id }) {
    const connection = await mysql.createConnection(connectionString);
    try {
      const [category] = await connection.query('SELECT id, nombre FROM categorias_producto WHERE id = ?', [id]);
      return category[0];
    } finally {
      await connection.end();
    }
  }
} 