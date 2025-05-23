import path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

export class ImageModel {
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

        if (Array.isArray(name)) {
            name = name[0]; // Manejo en caso de array de nombres
        }

        const filename = fileURLToPath(import.meta.url);
        const dir = dirname(filename);

        const imageName = typeof name === 'object' && name !== null ? name.filename : name;
        const imagePath = path.join(dir.toString(), '..', '..', '..', 'images', 'products', imageName);


        try {
            await fs.access(imagePath); // Verifica que existe
            await fs.unlink(imagePath); // Borra el archivo
            return 'Imagen eliminada correctamente';
        } catch (err) {
            throw new Error('No se pudo eliminar la imagen: ' + err.message);
        }
    }
} 
