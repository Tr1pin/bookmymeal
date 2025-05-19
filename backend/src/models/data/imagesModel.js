import path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

export class ImageModel {
    static async uptloadImage(file) {
    // Puedes guardar en una base de datos si usas un repositorio
    // Aquí devolvemos solo información básica del archivo
    return {
        filename: file.filename,
        originalname: file.originalname,
        path: path.resolve(file.path),
        size: file.size,
    };
    }
    static async getImageUrl({name: name}){
        if (!name) {
            return ({ message: 'falta el nombre de la imagen' });
        }
        const filename = fileURLToPath(import.meta.url);
        const dir = path.dirname(filename);
        const imagePath = path.join(dir, 'images', name);

        // Validate if the image exists   
        try {
            await fs.access(imagePath); // Verifica que existe
            const imageUrl = `http://localhost:3001/images/${name}`;
            return ({ imageUrl: imageUrl });
        } catch (err) {
            throw new Error('No se pudo encontrar la imagen');
        }
    }

    static async deleteImage({name: name}){
        if (!name) {
            return ({ message: 'falta el nombre de la imagen' });
        }

        const filename = fileURLToPath(import.meta.url);
        const dir = dirname(filename);
        const imagePath = path.join(dir, '../../../', '/images', name);

        try {
            await fs.access(imagePath); // Verifica que existe
            await fs.unlink(imagePath); // Borra el archivo
            return 'Imagen eliminada correctamente';
        } catch (err) {
            throw new Error('No se pudo eliminar la imagen: ' + err.message);
        }
    }
} 
