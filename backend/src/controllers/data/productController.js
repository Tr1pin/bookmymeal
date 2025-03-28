import { ProductModel } from '../../models/data/productModel.js';

export class ProductController {
  static async getAll(req, res) {
    try { 
        res.status(200).json(await ProductModel.getAll()); 
    }
    catch (err) { 
        res.status(500).json({ message: err.message }); 
    }
  }

  static async getById(req, res) {
    try { 
        res.status(200).json(await ProductModel.getById({ id: req.params.id })); 
    }
    catch (err) { 
        res.status(500).json({ message: err.message }); 
    }
  }

  static async getByNombre(req, res) {
    try { 
        res.status(200).json(await ProductModel.getByNombre({ nombre: req.params.nombre })); 
    }
    catch (err) { 
        res.status(500).json({ message: err.message }); 
    }
  }

  static async getByDisponibilidad(req, res) {
    try { 
        res.status(200).json(await ProductModel.getByDisponibilidad({ disponible: req.body.disponible })); 
    }
    catch (err) { 
      res.status(500).json({ message: err.message }); 
    }
  }

  static async crearProducto(req, res) {
    try { 
        res.status(200).json(await ProductModel.crearProducto(req.body)); 
    }
    catch (err) { 
        res.status(500).json({ message: err.message }); 
    }
  }

  static async actualizarProducto(req, res) {
    try { 
        res.status(200).json(await ProductModel.actualizarProducto(req.body)); 
    }
    catch (err) { 
        res.status(500).json({ message: err.message }); 
    }
  }

  static async eliminarProducto(req, res) {
    try { 
        res.status(200).json(await ProductModel.eliminarProducto({ id: req.params.id })); 
    }
    catch (err) { 
        res.status(500).json({ message: err.message }); 
    }
  }
}