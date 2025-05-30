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
    tipo_entrega: 'recogida' | 'domicilio';
    metodo_pago: 'efectivo' | 'tarjeta';
    direccion_entrega: string;
    fecha_creacion: string;
    productos: ProductOrder[];
    usuario: User;
}

interface User{
    id: string;
    nombre: string;
    telefono: string;
} 
