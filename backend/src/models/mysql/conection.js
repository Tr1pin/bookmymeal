import mysql from 'mysql2/promise';
import { DEFAULT_MYSQL_CONECTION } from "../../../config.js";

export const createConnection = async () => {
    try {
        const connection = await mysql.createConnection(DEFAULT_MYSQL_CONECTION);
        return connection;
    } catch (err) {
        console.log('error');
        throw err;
    }
};
