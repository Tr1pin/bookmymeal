import mysql from 'mysql2/promise'
import { DEFAULT_MYSQL_CONECTION } from '../../../config.js'

const connectionString = process.env.DATABASE_URL ?? DEFAULT_MYSQL_CONECTION


export class UserModel {
  //Getters de Usuarios
  static async getAll() {
    const connection = await mysql.createConnection(connectionString);
    const [rows] = await connection.query('SELECT * FROM usuarios');
    connection.destroy();
    return rows; 
  }

  //Usuario por ID
  static async getById({ id }) {

    if (!id) {
      throw new Error("El ID es undefined o null");
    }

    const connection = await mysql.createConnection(connectionString);
    const rows = await connection.query(
        `SELECT * FROM usuarios WHERE id = ?`, 
        [id]
    );

    connection.destroy();
    return rows[0];
  }

  //Usuario por Tipo
  static async getByTipo({ tipo }) {

    if (!tipo) {
      throw new Error("El Tipo es undefined o null");
    }

    const connection = await mysql.createConnection(connectionString);
    const rows = await connection.query(
        `SELECT * FROM usuarios WHERE tipo = ?`, 
        [tipo]
    );

    connection.destroy();
    return rows[0];
  }

  //Usuario por Email
  static async getByEmail({ email }) {

    if (!email) {
      throw new Error("El Email es undefined o null");
    }

    const connection = await mysql.createConnection(connectionString);
    const rows = await connection.query(
        `SELECT * FROM usuarios WHERE email = ?`, 
        [email]
    );

    connection.destroy();
    return rows[0];
  }

  //Usuario por Nombre
  static async getByNombre({ nombre }) {

    if (!nombre) {
      throw new Error("El Email es undefined o null");
    }

    const connection = await mysql.createConnection(connectionString);
    const rows = await connection.query(
        `SELECT * FROM usuarios WHERE nombre = ?`, 
        [nombre]
    );

    connection.destroy();
    return rows[0];
  }
}
