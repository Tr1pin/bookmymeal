import mysql from 'mysql2/promise'
import bcrypt from 'bcrypt';
import { validateUser } from '../../schemas/user.js';
import { randomUUID } from 'crypto';
import { DEFAULT_MYSQL_CONECTION, SALT_ROUNDS } from '../../../config.js'

const connectionString = process.env.DATABASE_URL ?? DEFAULT_MYSQL_CONECTION

export class UserModel {
  //Getters de Usuarios
  static async getAll() {
    const connection = await mysql.createConnection(connectionString);
    const [res] = await connection.query('SELECT * FROM usuarios');
    connection.destroy();
    return res; 
  }

  //Usuario por ID
  static async getById({ id }) {

    if (!id) {
      throw new Error("El ID es undefined o null");
    }

    const connection = await mysql.createConnection(connectionString);
    const res = await connection.query(
        `SELECT * FROM usuarios WHERE id = ?`, 
        [id]
    );

    connection.destroy();
    return res[0];
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
    return res[0];
  }

  //Usuario por Email
  static async getByEmail({ email }) {

    if (!email) {
      throw new Error("El Email es undefined o null");
    }

    const connection = await mysql.createConnection(connectionString);
    const res = await connection.query(
        `SELECT * FROM usuarios WHERE email = ?`, 
        [email]
    );

    connection.destroy();
    return res[0];
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
    return res[0];
  }

  //Crear Usuario
  static async createUsuario({ nombre, email, password }) {
      
      if (!nombre || !email || !password) {
        throw new Error("Faltan datos");
      }
  
      if(validateUser({ nombre, email, password }).success === false){
        throw new Error("Datos invalidos");
      }

      const connection = await mysql.createConnection(connectionString);
      const uuidRandom = randomUUID();
      const passwordEncriptado = bcrypt.hashSync(password, SALT_ROUNDS);
      const tipo = "cliente";

      const [res] = await connection.query(
          `INSERT INTO usuarios (id, nombre, email, password, tipo) VALUES (?, ?, ?, ?, ?)`, 
          [uuidRandom, nombre, email, passwordEncriptado, tipo]
      );
  
      connection.destroy();
      return { message: "Usuario registrado correctamente" };
  }
}
