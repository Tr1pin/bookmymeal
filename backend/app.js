import express from 'express';
import cors from 'cors';
import { DEFAULT_PORT } from './config.js';
import userDataRoutes from './src/routes/data/userDataRoutes.js';
import productDataRoutes from './src/routes/data/productDataRoutes.js';
import tableDataRoutes from './src/routes/data/tableDataRoutes.js';
import pedidoDataRoutes from './src/routes/data/pedidoDataRoutes.js';

export const createApp = () => {
    const app = express();

    app.use(cors());
    app.use(express.json());

    app.use("/users/", userDataRoutes);
    app.use("/productos/", productDataRoutes);
    app.use("/mesas/", tableDataRoutes);
    app.use("/pedidos/", pedidoDataRoutes);

    app.listen( DEFAULT_PORT, () =>{
        console.log(`Server listening on port  http://localhost:${DEFAULT_PORT}`);
    });
} 

createApp();