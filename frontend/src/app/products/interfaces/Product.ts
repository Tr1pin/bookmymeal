export interface Product {
    producto_id: string;
    nombre: string;
    descripcion: string;
    precio: string;
    disponible: number;
    imagens: string[];
    categoria_id?: string;
    categoria_nombre?: string;
}