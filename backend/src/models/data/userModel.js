import mysql from 'mysql2/promise'
import bcrypt from 'bcrypt';
import { validateUser, validatePartialUser } from '../../schemas/user.js';
import { randomUUID } from 'crypto';
import { DEFAULT_MYSQL_CONECTION, SALT_ROUNDS } from '../../../config.js'
import { console } from 'inspector';

const connectionString = process.env.DATABASE_URL ?? DEFAULT_MYSQL_CONECTION

export class UserModel {
  //Getters de Usuarios
  static async getAll() {
    const connection = await mysql.createConnection(connectionString);
    const [res] = await connection.query('SELECT * FROM usuarios');
    await connection.end();
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

    await connection.end();
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

    await connection.end();
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

    await connection.end();
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

    await connection.end();
    return res[0];
  }

  //Crear Usuario
  static async createUsuario({ nombre, email, password }) {
      
      if (!nombre || !email || !password) {
        throw new Error("Faltan datos para crear un Usuario");
      }
  
      if(validateUser({ nombre, email, password }).success === false){
        throw new Error(validateUser().error.message);
      }

      const connection = await mysql.createConnection(connectionString);
      const uuidRandom = randomUUID();
      const passwordEncriptado = bcrypt.hashSync(password, SALT_ROUNDS);
      const tipo = "cliente";

      const [res] = await connection.query(
          `INSERT INTO usuarios (id, nombre, email, password, tipo) VALUES (?, ?, ?, ?, ?)`, 
          [uuidRandom, nombre, email, passwordEncriptado, tipo]
      );
  
      await connection.end();
      return { message: "Usuario registrado correctamente" };
  }

  //Actualizar Usuario
  static async actualizarUsuario({ id, nombre, email, password }) {
    if (!id) {
      throw new Error("El ID es requerido");
    }

    const connection = await mysql.createConnection(connectionString);
    const updates = [];
    const values = {};

    if (nombre) {
      updates.push("nombre = ?");
      values.nombre = nombre;
    }

    if (email) {
      updates.push("email = ?");
      values.email = email;
    }

    if (password) {
      values.password = bcrypt.hashSync(password, SALT_ROUNDS);
      updates.push("password = ?");
    }

    if (updates.length === 0) {
      throw new Error("No hay datos para actualizar");
    }

    const filteredValues = Object.fromEntries(
      Object.entries(values).filter(([_, value]) => value !== undefined)
    );

    if(validatePartialUser(values).success === false){
      throw new Error(validatePartialUser().error.message);
    }
    
    const query = `UPDATE usuarios SET ${updates.join(", ")} WHERE id = ?`;
    const queryValues = [...Object.values(filteredValues), id];

    console.log("Query: "+query);
    console.log("QueryValues: "+queryValues);

    await connection.query(query, queryValues);
    await connection.end();

    return { message: "Usuario actualizado correctamente" };
  }
  
  //Eliminar Usuario
  static async eliminarUsuario({ id }) {
    if (!id) {
      throw new Error("El ID es requerido");
    }
  
    const connection = await mysql.createConnection(connectionString);
  
    await connection.query("DELETE FROM usuarios WHERE id = ?", [id]);
  
    await connection.end();
    return { message: "Usuario eliminado correctamente" };
  }

  //Actualizar Rol de Usuario
  static async actualizarRolUsuario({ id, tipo }) {
    if (!id || !tipo) {
      throw new Error("ID y tipo son requeridos");
    }
  
    const validRoles = ["cliente", "admin", "empleado"];
    if (!validRoles.includes(tipo)) {
      throw new Error("Rol inválido");
    }
  
    const connection = await mysql.createConnection(connectionString);
  
    await connection.query("UPDATE usuarios SET tipo = ? WHERE id = ?", [tipo, id]);
  
    await connection.end();
    return { message: "Rol actualizado correctamente" };
  }
  
  
}
