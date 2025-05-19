import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ImageModel } from '../../models/data/imagesModel.js';


export class ImageController {
    static async uploadImage(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No se subió ningún archivo' });
            }

            const fileInfo = await ImageModel.uptloadImage(req.file);
            return res.status(200).json({ message: 'Archivo subido', file: fileInfo });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    static async getImageUrl (req, res)  {
        const { name } = req.params;
      
        if (!name) {
          return res.status(400).json({ error: 'Falta el nombre de la imagen' });
        }

        try {
          const message = await ImageModel.getImageUrl({name: name});
          res.status(200).json({ message:  message});
        } catch (err) {
          res.status(500).json({ error: err.message });
        }
    };

    static async deleteImage (req, res) {
        const { name } = req.params;
      
        if (!name) {
          return res.status(400).json({ error: 'Falta el nombre de la imagen' });
        }
        
        try {
          const message = await ImageModel.deleteImage({name: name});
          res.status(200).json({ message:  message});
        } catch (err) {
          res.status(500).json({ error: err.message });
        }
    }
}