import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { DEFAULT_PORT } from './config.js';
import userDataRoutes from './src/routes/data/userDataRoutes.js';
import productDataRoutes from './src/routes/data/productDataRoutes.js';
import tableDataRoutes from './src/routes/data/tableDataRoutes.js';
import pedidoDataRoutes from './src/routes/data/pedidoDataRoutes.js';
import detallesPedidosDataRoutes from './src/routes/data/detallesPedidoRouter.js';
import reservasDataRoutes from './src/routes/data/reservasDataRouter.js';
import imagesDataRoutes from './src/routes/data/imagesRouter.js';
import productCategoryDataRoutes from './src/routes/data/productCategoryDataRoutes.js';
import userlogContoller from './src/routes/auth/userlogRouter.js';
import emailDataRoutes from './src/routes/emails/emailRoutes.js';

export const createApp = () => {
    const app = express();

    app.use(cors());
    app.use(express.json());

    // Get the directory name of the current module
    // To serve static images
    const filename = fileURLToPath(import.meta.url);
    const dir = dirname(filename);
    // Expose images folder
    app.use('/images/products', express.static(path.join(dir, 'images', 'products')));

    // Calls to endponits
    app.use("/", userlogContoller);
    app.use("/users/", userDataRoutes);
    app.use("/productos/", productDataRoutes);
    app.use("/mesas/", tableDataRoutes);
    app.use("/pedidos/", pedidoDataRoutes);
    app.use("/detalles-pedidos/", detallesPedidosDataRoutes);
    app.use("/reservas/", reservasDataRoutes);
    app.use("/images/",  imagesDataRoutes);
    app.use("/product-categories/", productCategoryDataRoutes);
    app.use("/emails/", emailDataRoutes);

    app.listen( DEFAULT_PORT, () =>{
        console.log(`Server listening on port  http://localhost:${DEFAULT_PORT}`);
    });
} 

createApp();