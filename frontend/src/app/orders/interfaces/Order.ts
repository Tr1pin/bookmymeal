export interface ProductOrder {
    nombre: string;
    cantidad: number;
    subtotal: string;
    precio: string;
}

export interface Order {
    numero_pedido: string;
    pedido_id: string;
    estado: string;
    total: string;
    productos: ProductOrder[];
    usuario: User;
}

interface User{
    id: string;
    nombre: string;
} 
