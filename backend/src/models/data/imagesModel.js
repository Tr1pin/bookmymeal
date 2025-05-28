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
        const imagePath = path.join(dir, '..', '..', '..', 'images', 'products', name);
        
        // Validate if the image exists   
        try {
            await fs.access(imagePath); // Verifica que existe
            const imageUrl = `http://localhost:3001/images/products/${name}`;
            return ({ imageUrl: imageUrl });
        } catch (err) {
            throw new Error('No se pudo encontrar la imagen');
        }
    }

    static async deleteImage({name: name}){
        if (!name) {
            return ({ message: 'falta el nombre de la imagen' });
        }

        // Ensure name is a string
        let imageName;
        if (Array.isArray(name)) {
            imageName = name[0];
        } else if (typeof name === 'object' && name !== null) {
            imageName = name.filename;
        } else {
            imageName = name;
        }

        if (!imageName) {
            throw new Error('Nombre de imagen inválido');
        }

        const filename = fileURLToPath(import.meta.url);
        const dir = dirname(filename);
        
        // Construct absolute path more safely
        const imagePath = path.join(dir, '..', '..', '..', 'images', 'products', imageName);

        try {
            await fs.access(imagePath); // Verify file exists
            await fs.unlink(imagePath); // Delete the file
            return 'Imagen eliminada correctamente';
        } catch (err) {
            throw new Error('No se pudo eliminar la imagen: ' + err.message);
        }
    }
} 
