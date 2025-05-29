import { ProductCategoryModel } from '../../models/data/productCategoryModel.js';

export class ProductCategoryController {
  static async getAll(req, res) {
    try {
      const categories = await ProductCategoryModel.getAll();
      res.status(200).json(categories);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  static async getById(req, res) {
    try {
      const category = await ProductCategoryModel.getById({ id: req.params.id });
      if (category) {
        res.status(200).json(category);
      } else {
        res.status(404).json({ message: 'Category not found' });
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
} 