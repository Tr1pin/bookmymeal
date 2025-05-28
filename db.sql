CREATE DATABASE bookmymeal;
use bookmymeal;

CREATE TABLE usuarios (
	id CHAR(36) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(15),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    rol ENUM('admin', 'cliente') DEFAULT 'cliente'
);

-- Tabla de mesas
CREATE TABLE IF NOT EXISTS mesas (
	id CHAR(36) PRIMARY KEY,
    numero INT UNIQUE NOT NULL,
    capacidad INT NOT NULL CHECK (capacidad > 0)
);

CREATE TABLE IF NOT EXISTS reservas (
    id CHAR(36) PRIMARY KEY,
    usuario_id CHAR(36) NOT NULL,
    mesa_id CHAR(36) NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    estado ENUM('pendiente', 'confirmada', 'cancelada', 'completada') DEFAULT 'pendiente',
    personas INT NOT NULL CHECK (personas > 0),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (mesa_id) REFERENCES mesas(id) ON DELETE CASCADE
);

-- Tabla de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id CHAR(36) PRIMARY KEY,
    numero_pedido varchar(20),
    usuario_id CHAR(36) NOT NULL,
    estado ENUM('pendiente', 'en preparación', 'listo', 'entregado', 'cancelado') DEFAULT 'pendiente',
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS productos (
    id CHAR(36) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL CHECK (precio > 0),
    disponible BOOLEAN DEFAULT TRUE
);

-- Tabla de detalles de pedido
CREATE TABLE IF NOT EXISTS detalles_pedido (
id CHAR(36) PRIMARY KEY,
    pedido_id CHAR(36) NOT NULL,
    producto_id CHAR(36) NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS imagenes_productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id CHAR(36) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);

-- Insertar usuarios más realistas
INSERT INTO usuarios (id, nombre, telefono, email, password, rol) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'María García López', '612345678', 'maria.garcia@gmail.com', '$2b$10$hashedpassword1', 'cliente'),
('550e8400-e29b-41d4-a716-446655440002', 'Carlos Rodríguez Pérez', '687654321', 'carlos.rodriguez@hotmail.com', '$2b$10$hashedpassword2', 'cliente'),
('550e8400-e29b-41d4-a716-446655440003', 'Ana Martínez Silva', '634567890', 'ana.martinez@yahoo.es', '$2b$10$hashedpassword3', 'cliente'),
('550e8400-e29b-41d4-a716-446655440004', 'Luis Fernández Torres', '698765432', 'luis.fernandez@gmail.com', '$2b$10$hashedpassword4', 'cliente'),
('550e8400-e29b-41d4-a716-446655440005', 'Elena Sánchez Ruiz', '645678901', 'elena.sanchez@outlook.com', '$2b$10$hashedpassword5', 'cliente'),
('550e8400-e29b-41d4-a716-446655440006', 'David López Moreno', '676543210', 'david.lopez@gmail.com', '$2b$10$hashedpassword6', 'cliente'),
('550e8400-e29b-41d4-a716-446655440007', 'Carmen Jiménez Vega', '623456789', 'carmen.jimenez@hotmail.com', '$2b$10$hashedpassword7', 'cliente'),
('550e8400-e29b-41d4-a716-446655440008', 'Javier Herrera Castro', '689012345', 'javier.herrera@yahoo.es', '$2b$10$hashedpassword8', 'cliente'),
('550e8400-e29b-41d4-a716-446655440009', 'Isabel Romero Díaz', '654321098', 'isabel.romero@gmail.com', '$2b$10$hashedpassword9', 'cliente'),
('550e8400-e29b-41d4-a716-446655440010', 'Roberto Admin', '600000000', 'admin@bookmymeal.com', '$2b$10$adminhashedpassword', 'admin');

-- Insertar mesas más realistas
INSERT INTO mesas (id, numero, capacidad) VALUES
('650e8400-e29b-41d4-a716-446655440001', 1, 2),
('650e8400-e29b-41d4-a716-446655440002', 2, 2),
('650e8400-e29b-41d4-a716-446655440003', 3, 4),
('650e8400-e29b-41d4-a716-446655440004', 4, 4),
('650e8400-e29b-41d4-a716-446655440005', 5, 4),
('650e8400-e29b-41d4-a716-446655440006', 6, 6),
('650e8400-e29b-41d4-a716-446655440007', 7, 6),
('650e8400-e29b-41d4-a716-446655440008', 8, 8),
('650e8400-e29b-41d4-a716-446655440009', 9, 2),
('650e8400-e29b-41d4-a716-446655440010', 10, 4);

-- Insertar reservas más realistas
INSERT INTO reservas (id, usuario_id, mesa_id, fecha, hora, estado, personas) VALUES
('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440003', '2025-01-15', '20:00:00', 'confirmada', 3),
('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', '2025-01-15', '21:00:00', 'confirmada', 2),
('750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440006', '2025-01-16', '19:30:00', 'pendiente', 5),
('750e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440002', '2025-01-16', '20:30:00', 'confirmada', 2),
('750e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440008', '2025-01-17', '13:00:00', 'confirmada', 7),
('750e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440004', '2025-01-17', '14:30:00', 'pendiente', 4),
('750e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440009', '2025-01-18', '12:30:00', 'confirmada', 2),
('750e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440008', '650e8400-e29b-41d4-a716-446655440007', '2025-01-18', '21:30:00', 'cancelada', 6),
('750e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440009', '650e8400-e29b-41d4-a716-446655440005', '2025-01-19', '20:00:00', 'completada', 4),
('750e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440010', '2025-01-20', '13:30:00', 'confirmada', 4);

-- Insertar productos más realistas
INSERT INTO productos (id, nombre, descripcion, precio, disponible) VALUES
('850e8400-e29b-41d4-a716-446655440001', 'Pizza Margarita', 'Pizza clásica con salsa de tomate, mozzarella fresca y albahaca', 12.50, TRUE),
('850e8400-e29b-41d4-a716-446655440002', 'Pizza Pepperoni', 'Pizza con salsa de tomate, mozzarella y pepperoni picante', 14.90, TRUE),
('850e8400-e29b-41d4-a716-446655440003', 'Pizza Cuatro Quesos', 'Pizza con mozzarella, gorgonzola, parmesano y queso de cabra', 16.50, TRUE),
('850e8400-e29b-41d4-a716-446655440004', 'Hamburguesa Clásica', 'Hamburguesa de ternera con lechuga, tomate, cebolla y salsa especial', 11.90, TRUE),
('850e8400-e29b-41d4-a716-446655440005', 'Hamburguesa BBQ', 'Hamburguesa de ternera con bacon, queso cheddar y salsa BBQ', 13.50, TRUE),
('850e8400-e29b-41d4-a716-446655440006', 'Hamburguesa Vegana', 'Hamburguesa de quinoa y verduras con aguacate y salsa tahini', 12.90, TRUE),
('850e8400-e29b-41d4-a716-446655440007', 'Ensalada César', 'Lechuga romana, pollo a la plancha, parmesano y aderezo César', 9.50, TRUE),
('850e8400-e29b-41d4-a716-446655440008', 'Ensalada Mediterránea', 'Mix de lechugas, tomate cherry, aceitunas, queso feta y vinagreta', 8.90, TRUE),
('850e8400-e29b-41d4-a716-446655440009', 'Pasta Carbonara', 'Espaguetis con bacon, huevo, parmesano y pimienta negra', 10.50, TRUE),
('850e8400-e29b-41d4-a716-446655440010', 'Pasta Boloñesa', 'Espaguetis con salsa de carne tradicional italiana', 11.90, TRUE),
('850e8400-e29b-41d4-a716-446655440011', 'Risotto de Setas', 'Arroz cremoso con setas variadas y parmesano', 13.90, TRUE),
('850e8400-e29b-41d4-a716-446655440012', 'Salmón a la Plancha', 'Filete de salmón con verduras salteadas y salsa de limón', 18.50, TRUE),
('850e8400-e29b-41d4-a716-446655440013', 'Pollo al Curry', 'Pechuga de pollo en salsa de curry con arroz basmati', 14.90, TRUE),
('850e8400-e29b-41d4-a716-446655440014', 'Tiramisú', 'Postre italiano tradicional con café y mascarpone', 6.50, TRUE),
('850e8400-e29b-41d4-a716-446655440015', 'Cheesecake de Frutos Rojos', 'Tarta de queso con coulis de frutos del bosque', 7.20, TRUE);

-- Insertar pedidos más realistas
INSERT INTO pedidos (id, numero_pedido, usuario_id, estado, total) VALUES
('950e8400-e29b-41d4-a716-446655440001', 'PED-2025-001', '550e8400-e29b-41d4-a716-446655440001', 'entregado', 32.40),
('950e8400-e29b-41d4-a716-446655440002', 'PED-2025-002', '550e8400-e29b-41d4-a716-446655440002', 'en preparación', 25.80),
('950e8400-e29b-41d4-a716-446655440003', 'PED-2025-003', '550e8400-e29b-41d4-a716-446655440003', 'listo', 18.40),
('950e8400-e29b-41d4-a716-446655440004', 'PED-2025-004', '550e8400-e29b-41d4-a716-446655440004', 'pendiente', 41.30),
('950e8400-e29b-41d4-a716-446655440005', 'PED-2025-005', '550e8400-e29b-41d4-a716-446655440005', 'entregado', 29.90),
('950e8400-e29b-41d4-a716-446655440006', 'PED-2025-006', '550e8400-e29b-41d4-a716-446655440006', 'en preparación', 22.40),
('950e8400-e29b-41d4-a716-446655440007', 'PED-2025-007', '550e8400-e29b-41d4-a716-446655440007', 'cancelado', 0.00),
('950e8400-e29b-41d4-a716-446655440008', 'PED-2025-008', '550e8400-e29b-41d4-a716-446655440008', 'entregado', 37.80);

-- Insertar detalles de pedido más realistas
INSERT INTO detalles_pedido (id, pedido_id, producto_id, cantidad, subtotal) VALUES
-- Pedido 1: Pizza Margarita + Ensalada César + Tiramisú
('a50e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', 1, 12.50),
('a50e8400-e29b-41d4-a716-446655440002', '950e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440007', 1, 9.50),
('a50e8400-e29b-41d4-a716-446655440003', '950e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440014', 2, 13.00),

-- Pedido 2: Hamburguesa BBQ + Pasta Carbonara
('a50e8400-e29b-41d4-a716-446655440004', '950e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440005', 1, 13.50),
('a50e8400-e29b-41d4-a716-446655440005', '950e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440009', 1, 10.50),

-- Pedido 3: Salmón a la Plancha
('a50e8400-e29b-41d4-a716-446655440006', '950e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440012', 1, 18.50),

-- Pedido 4: Pizza Cuatro Quesos + Risotto + Cheesecake
('a50e8400-e29b-41d4-a716-446655440007', '950e8400-e29b-41d4-a716-446655440004', '850e8400-e29b-41d4-a716-446655440003', 1, 16.50),
('a50e8400-e29b-41d4-a716-446655440008', '950e8400-e29b-41d4-a716-446655440004', '850e8400-e29b-41d4-a716-446655440011', 1, 13.90),
('a50e8400-e29b-41d4-a716-446655440009', '950e8400-e29b-41d4-a716-446655440004', '850e8400-e29b-41d4-a716-446655440015', 2, 14.40),

-- Pedido 5: Pollo al Curry + Ensalada Mediterránea + Tiramisú
('a50e8400-e29b-41d4-a716-446655440010', '950e8400-e29b-41d4-a716-446655440005', '850e8400-e29b-41d4-a716-446655440013', 1, 14.90),
('a50e8400-e29b-41d4-a716-446655440011', '950e8400-e29b-41d4-a716-446655440005', '850e8400-e29b-41d4-a716-446655440008', 1, 8.90),
('a50e8400-e29b-41d4-a716-446655440012', '950e8400-e29b-41d4-a716-446655440005', '850e8400-e29b-41d4-a716-446655440014', 1, 6.50),

-- Pedido 6: Hamburguesa Vegana + Pasta Boloñesa
('a50e8400-e29b-41d4-a716-446655440013', '950e8400-e29b-41d4-a716-446655440006', '850e8400-e29b-41d4-a716-446655440006', 1, 12.90),
('a50e8400-e29b-41d4-a716-446655440014', '950e8400-e29b-41d4-a716-446655440006', '850e8400-e29b-41d4-a716-446655440010', 1, 11.90),

-- Pedido 8: Pizza Pepperoni + Ensalada César + Cheesecake
('a50e8400-e29b-41d4-a716-446655440015', '950e8400-e29b-41d4-a716-446655440008', '850e8400-e29b-41d4-a716-446655440002', 1, 14.90),
('a50e8400-e29b-41d4-a716-446655440016', '950e8400-e29b-41d4-a716-446655440008', '850e8400-e29b-41d4-a716-446655440007', 1, 9.50),
('a50e8400-e29b-41d4-a716-446655440017', '950e8400-e29b-41d4-a716-446655440008', '850e8400-e29b-41d4-a716-446655440015', 2, 14.40);

-- Insertar imágenes de productos más realistas
INSERT INTO imagenes_productos (producto_id, filename) VALUES
('850e8400-e29b-41d4-a716-446655440001', 'pizza_margarita.jpg'),
('850e8400-e29b-41d4-a716-446655440001', 'pizza_margarita_2.jpg'),
('850e8400-e29b-41d4-a716-446655440002', 'pizza_pepperoni.jpg'),
('850e8400-e29b-41d4-a716-446655440002', 'pizza_pepperoni_2.jpg'),
('850e8400-e29b-41d4-a716-446655440003', 'pizza_cuatro_quesos.jpg'),
('850e8400-e29b-41d4-a716-446655440004', 'hamburguesa_clasica.jpg'),
('850e8400-e29b-41d4-a716-446655440004', 'hamburguesa_clasica_2.jpg'),
('850e8400-e29b-41d4-a716-446655440005', 'hamburguesa_bbq.jpg'),
('850e8400-e29b-41d4-a716-446655440005', 'hamburguesa_bbq_2.jpg'),
('850e8400-e29b-41d4-a716-446655440006', 'hamburguesa_vegana.jpg'),
('850e8400-e29b-41d4-a716-446655440007', 'ensalada_cesar.jpg'),
('850e8400-e29b-41d4-a716-446655440007', 'ensalada_cesar_2.jpg'),
('850e8400-e29b-41d4-a716-446655440008', 'ensalada_mediterranea.jpg'),
('850e8400-e29b-41d4-a716-446655440009', 'pasta_carbonara.jpg'),
('850e8400-e29b-41d4-a716-446655440010', 'pasta_bolonesa.jpg'),
('850e8400-e29b-41d4-a716-446655440011', 'risotto_setas.jpg'),
('850e8400-e29b-41d4-a716-446655440012', 'salmon_plancha.jpg'),
('850e8400-e29b-41d4-a716-446655440013', 'pollo_curry.jpg'),
('850e8400-e29b-41d4-a716-446655440014', 'tiramisu.jpg'),
('850e8400-e29b-41d4-a716-446655440015', 'cheesecake_frutos_rojos.jpg');

-- Consultas útiles para verificar los datos

-- Ver todas las reservas con información completa
SELECT 
    r.id AS reserva_id,
    u.nombre AS nombre_usuario,
    u.telefono,
    m.numero AS numero_mesa,
    DATE_FORMAT(r.fecha, '%Y-%m-%d') as fecha,
    r.hora,
    r.estado,
    r.personas
FROM reservas r
JOIN usuarios u ON r.usuario_id = u.id
JOIN mesas m ON r.mesa_id = m.id
ORDER BY r.fecha, r.hora;

-- Ver todos los pedidos con información completa
SELECT 
    p.id AS pedido_id, 
    p.numero_pedido,
    u.nombre AS nombre_usuario,
    u.telefono,
    p.estado, 
    p.total,
    pr.nombre AS producto, 
    pr.precio, 
    dp.cantidad, 
    dp.subtotal 
FROM pedidos p 
JOIN usuarios u ON p.usuario_id = u.id
JOIN detalles_pedido dp ON p.id = dp.pedido_id 
JOIN productos pr ON dp.producto_id = pr.id 
ORDER BY p.numero_pedido, pr.nombre;

-- Ver todos los productos con sus imágenes
SELECT 
    p.id AS producto_id,
    p.nombre,
    p.descripcion,
    FORMAT(p.precio, 2) AS precio,
    p.disponible,
    GROUP_CONCAT(i.filename) AS imagenes
FROM 
    productos p
LEFT JOIN 
    imagenes_productos i ON p.id = i.producto_id
GROUP BY 
    p.id, p.nombre, p.descripcion, p.precio, p.disponible
ORDER BY p.nombre;


