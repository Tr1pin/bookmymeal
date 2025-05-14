export interface Reservation {
    reserva_id: string;
    nombre_usuario: string;
    numero_mesa: number;
    fecha: Date;
    hora: string;
    estado: string;
    personas: number;
}
