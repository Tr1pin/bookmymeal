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
    nombre_contacto VARCHAR(100) NULL,
    telefono_contacto VARCHAR(15) NULL,
    email_contacto VARCHAR(100) NULL,
    usuario_id CHAR(36),
    tipo_entrega ENUM('recogida', 'domicilio') NOT NULL DEFAULT 'recogida',
    metodo_pago ENUM('efectivo', 'tarjeta') NOT NULL DEFAULT 'efectivo',
    direccion_calle VARCHAR(255) NULL,
    direccion_ciudad VARCHAR(100) NULL,
    direccion_codigo_postal VARCHAR(10) NULL,
    direccion_telefono VARCHAR(15) NULL,
    estado ENUM('pendiente', 'en preparación', 'listo', 'entregado', 'cancelado') DEFAULT 'pendiente',
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS productos (
    id CHAR(36) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL CHECK (precio > 0),
    disponible BOOLEAN DEFAULT TRUE
);

-- Tabla de categorias de producto
CREATE TABLE IF NOT EXISTS categorias_producto (
    id CHAR(36) PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL
);

-- Modificar tabla de productos para incluir categoria_id
ALTER TABLE productos
ADD COLUMN categoria_id CHAR(36),
ADD FOREIGN KEY (categoria_id) REFERENCES categorias_producto(id);

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

-- Insertar categorias de producto
INSERT INTO categorias_producto (id, nombre) VALUES
('c50e8400-e29b-41d4-a716-446655440001', 'Pizzas'),
('c50e8400-e29b-41d4-a716-446655440002', 'Hamburguesas'),
('c50e8400-e29b-41d4-a716-446655440003', 'Ensaladas'),
('c50e8400-e29b-41d4-a716-446655440004', 'Pastas'),
('c50e8400-e29b-41d4-a716-446655440005', 'Platos Principales'),
('c50e8400-e29b-41d4-a716-446655440006', 'Postres'),
('c50e8400-e29b-41d4-a716-446655440007', 'Bebidas');

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

-- Insertar productos más realistas
INSERT INTO productos (id, nombre, descripcion, precio, disponible, categoria_id) VALUES
('850e8400-e29b-41d4-a716-446655440001', 'Pizza Margarita', 'Pizza clásica con salsa de tomate, mozzarella fresca y albahaca', 12.50, TRUE, 'c50e8400-e29b-41d4-a716-446655440001'),
('850e8400-e29b-41d4-a716-446655440002', 'Pizza Pepperoni', 'Pizza con salsa de tomate, mozzarella y pepperoni picante', 14.90, TRUE, 'c50e8400-e29b-41d4-a716-446655440001'),
('850e8400-e29b-41d4-a716-446655440003', 'Pizza Cuatro Quesos', 'Pizza con mozzarella, gorgonzola, parmesano y queso de cabra', 16.50, TRUE, 'c50e8400-e29b-41d4-a716-446655440001'),
('850e8400-e29b-41d4-a716-446655440004', 'Hamburguesa Clásica', 'Hamburguesa de ternera con lechuga, tomate, cebolla y salsa especial', 11.90, TRUE, 'c50e8400-e29b-41d4-a716-446655440002'),
('850e8400-e29b-41d4-a716-446655440005', 'Hamburguesa BBQ', 'Hamburguesa de ternera con bacon, queso cheddar y salsa BBQ', 13.50, TRUE, 'c50e8400-e29b-41d4-a716-446655440002'),
('850e8400-e29b-41d4-a716-446655440006', 'Hamburguesa Vegana', 'Hamburguesa de quinoa y verduras con aguacate y salsa tahini', 12.90, TRUE, 'c50e8400-e29b-41d4-a716-446655440002'),
('850e8400-e29b-41d4-a716-446655440007', 'Ensalada César', 'Lechuga romana, pollo a la plancha, parmesano y aderezo César', 9.50, TRUE, 'c50e8400-e29b-41d4-a716-446655440003'),
('850e8400-e29b-41d4-a716-446655440008', 'Ensalada Mediterránea', 'Mix de lechugas, tomate cherry, aceitunas, queso feta y vinagreta', 8.90, TRUE, 'c50e8400-e29b-41d4-a716-446655440003'),
('850e8400-e29b-41d4-a716-446655440009', 'Pasta Carbonara', 'Espaguetis con bacon, huevo, parmesano y pimienta negra', 10.50, TRUE, 'c50e8400-e29b-41d4-a716-446655440004'),
('850e8400-e29b-41d4-a716-446655440010', 'Pasta Boloñesa', 'Espaguetis con salsa de carne tradicional italiana', 11.90, TRUE, 'c50e8400-e29b-41d4-a716-446655440004'),
('850e8400-e29b-41d4-a716-446655440011', 'Risotto de Setas', 'Arroz cremoso con setas variadas y parmesano', 13.90, TRUE, 'c50e8400-e29b-41d4-a716-446655440005'),
('850e8400-e29b-41d4-a716-446655440012', 'Salmón a la Plancha', 'Filete de salmón con verduras salteadas y salsa de limón', 18.50, TRUE, 'c50e8400-e29b-41d4-a716-446655440005'),
('850e8400-e29b-41d4-a716-446655440013', 'Pollo al Curry', 'Pechuga de pollo en salsa de curry con arroz basmati', 14.90, TRUE, 'c50e8400-e29b-41d4-a716-446655440005'),
('850e8400-e29b-41d4-a716-446655440014', 'Tiramisú', 'Postre italiano tradicional con café y mascarpone', 6.50, TRUE, 'c50e8400-e29b-41d4-a716-446655440006'),
('850e8400-e29b-41d4-a716-446655440015', 'Cheesecake de Frutos Rojos', 'Tarta de queso con coulis de frutos del bosque', 7.20, TRUE, 'c50e8400-e29b-41d4-a716-446655440006');

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
('750e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440010', '2025-01-20', '13:30:00', 'confirmada', 4),

-- 🔥 RESERVAS PARA SATURAR EL DÍA 2025-01-20 (día completo para pruebas) 🔥
-- Mesa 1 (capacidad 2) - SATURADA CENA
('750e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', '2025-01-20', '20:00:00', 'confirmada', 2),
('750e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440001', '2025-01-20', '20:30:00', 'confirmada', 2),
('750e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440001', '2025-01-20', '21:00:00', 'confirmada', 2),
('750e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440001', '2025-01-20', '21:30:00', 'confirmada', 2),

-- Mesa 2 (capacidad 2) - SATURADA CENA
('750e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440002', '2025-01-20', '20:00:00', 'confirmada', 2),
('750e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440002', '2025-01-20', '20:30:00', 'confirmada', 2),
('750e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440008', '650e8400-e29b-41d4-a716-446655440002', '2025-01-20', '21:00:00', 'confirmada', 2),
('750e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440009', '650e8400-e29b-41d4-a716-446655440002', '2025-01-20', '21:30:00', 'confirmada', 2),

-- Mesa 3 (capacidad 4) - SATURADA CENA 
('750e8400-e29b-41d4-a716-446655440019', '550e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440003', '2025-01-20', '20:00:00', 'confirmada', 4),
('750e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440003', '2025-01-20', '20:30:00', 'confirmada', 3),
('750e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440003', '2025-01-20', '21:00:00', 'confirmada', 4),
('750e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440003', '2025-01-20', '21:30:00', 'confirmada', 4),

-- Mesa 4 (capacidad 4) - SATURADA CENA
('750e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440004', '2025-01-20', '20:00:00', 'confirmada', 4),
('750e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440004', '2025-01-20', '20:30:00', 'confirmada', 3),
('750e8400-e29b-41d4-a716-446655440025', '550e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440004', '2025-01-20', '21:00:00', 'confirmada', 4),
('750e8400-e29b-41d4-a716-446655440026', '550e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440004', '2025-01-20', '21:30:00', 'confirmada', 4),

-- Mesa 5 (capacidad 4) - SATURADA CENA
('750e8400-e29b-41d4-a716-446655440027', '550e8400-e29b-41d4-a716-446655440008', '650e8400-e29b-41d4-a716-446655440005', '2025-01-20', '20:00:00', 'confirmada', 4),
('750e8400-e29b-41d4-a716-446655440028', '550e8400-e29b-41d4-a716-446655440009', '650e8400-e29b-41d4-a716-446655440005', '2025-01-20', '20:30:00', 'confirmada', 3),
('750e8400-e29b-41d4-a716-446655440029', '550e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440005', '2025-01-20', '21:00:00', 'confirmada', 4),
('750e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440005', '2025-01-20', '21:30:00', 'confirmada', 4),

-- Mesa 6 (capacidad 6) - SATURADA CENA
('750e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440006', '2025-01-20', '20:00:00', 'confirmada', 6),
('750e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440006', '2025-01-20', '20:30:00', 'confirmada', 5),
('750e8400-e29b-41d4-a716-446655440033', '550e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440006', '2025-01-20', '21:00:00', 'confirmada', 6),
('750e8400-e29b-41d4-a716-446655440034', '550e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440006', '2025-01-20', '21:30:00', 'confirmada', 6),

-- Mesa 7 (capacidad 6) - SATURADA CENA
('750e8400-e29b-41d4-a716-446655440035', '550e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440007', '2025-01-20', '20:00:00', 'confirmada', 6),
('750e8400-e29b-41d4-a716-446655440036', '550e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440007', '2025-01-20', '20:30:00', 'confirmada', 5),
('750e8400-e29b-41d4-a716-446655440037', '550e8400-e29b-41d4-a716-446655440008', '650e8400-e29b-41d4-a716-446655440007', '2025-01-20', '21:00:00', 'confirmada', 6),
('750e8400-e29b-41d4-a716-446655440038', '550e8400-e29b-41d4-a716-446655440009', '650e8400-e29b-41d4-a716-446655440007', '2025-01-20', '21:30:00', 'confirmada', 6),

-- Mesa 8 (capacidad 8) - SATURADA CENA
('750e8400-e29b-41d4-a716-446655440039', '550e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440008', '2025-01-20', '20:00:00', 'confirmada', 8),
('750e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440008', '2025-01-20', '20:30:00', 'confirmada', 7),
('750e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440008', '2025-01-20', '21:00:00', 'confirmada', 8),
('750e8400-e29b-41d4-a716-446655440042', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440008', '2025-01-20', '21:30:00', 'confirmada', 8),

-- Mesa 9 (capacidad 2) - SATURADA CENA
('750e8400-e29b-41d4-a716-446655440043', '550e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440009', '2025-01-20', '20:00:00', 'confirmada', 2),
('750e8400-e29b-41d4-a716-446655440044', '550e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440009', '2025-01-20', '20:30:00', 'confirmada', 2),
('750e8400-e29b-41d4-a716-446655440045', '550e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440009', '2025-01-20', '21:00:00', 'confirmada', 2),
('750e8400-e29b-41d4-a716-446655440046', '550e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440009', '2025-01-20', '21:30:00', 'confirmada', 2),

-- Mesa 10 (capacidad 4) - ALGUNAS HORAS LIBRES (para mostrar alternativas)
('750e8400-e29b-41d4-a716-446655440047', '550e8400-e29b-41d4-a716-446655440008', '650e8400-e29b-41d4-a716-446655440010', '2025-01-20', '20:00:00', 'confirmada', 4),
('750e8400-e29b-41d4-a716-446655440048', '550e8400-e29b-41d4-a716-446655440009', '650e8400-e29b-41d4-a716-446655440010', '2025-01-20', '21:00:00', 'confirmada', 4),
-- ⚠️ 20:30 y 21:30 LIBRES en mesa 10 para mostrar alternativas

-- ALGUNAS HORAS DE COMIDA TAMBIÉN OCUPADAS
('750e8400-e29b-41d4-a716-446655440049', '550e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440003', '2025-01-20', '12:00:00', 'confirmada', 4),
('750e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440004', '2025-01-20', '12:30:00', 'confirmada', 4),
('750e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440005', '2025-01-20', '13:00:00', 'confirmada', 4),
('750e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440006', '2025-01-20', '14:00:00', 'confirmada', 6),
('750e8400-e29b-41d4-a716-446655440053', '550e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440007', '2025-01-20', '14:30:00', 'confirmada', 6),
('750e8400-e29b-41d4-a716-446655440054', '550e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440008', '2025-01-20', '15:00:00', 'confirmada', 8);

-- Insertar pedidos más realistas
INSERT INTO pedidos (id, numero_pedido, nombre_contacto, telefono_contacto, email_contacto, usuario_id, tipo_entrega, metodo_pago, direccion_calle, direccion_ciudad, direccion_codigo_postal, direccion_telefono, estado, total) VALUES
('950e8400-e29b-41d4-a716-446655440001', 'PED-2025-001', 'María García López', '612345678', 'maria.garcia@gmail.com', '550e8400-e29b-41d4-a716-446655440001', 'domicilio', 'tarjeta', 'Calle Mayor 123, 2º B', 'Madrid', '28001', '612345678', 'entregado', 32.40),
('950e8400-e29b-41d4-a716-446655440002', 'PED-2025-002', 'Carlos Rodríguez Pérez', '687654321', 'carlos.rodriguez@hotmail.com', '550e8400-e29b-41d4-a716-446655440002', 'recogida', 'efectivo', NULL, NULL, NULL, NULL, 'en preparación', 25.80),
('950e8400-e29b-41d4-a716-446655440003', 'PED-2025-003', NULL, NULL, NULL, NULL, 'recogida', 'tarjeta', NULL, NULL, NULL, NULL, 'listo', 18.40),
('950e8400-e29b-41d4-a716-446655440004', 'PED-2025-004', 'Ana Martínez Silva', '634567890', 'ana.martinez@yahoo.es', '550e8400-e29b-41d4-a716-446655440004', 'domicilio', 'efectivo', 'Avenida de la Paz 45, 1º A', 'Barcelona', '08015', '698765432', 'pendiente', 41.30),
('950e8400-e29b-41d4-a716-446655440005', 'PED-2025-005', 'Elena Sánchez Ruiz', '645678901', 'elena.sanchez@outlook.com', '550e8400-e29b-41d4-a716-446655440005', 'domicilio', 'tarjeta', 'Plaza España 8, 3º C', 'Valencia', '46001', '645678901', 'entregado', 29.90),
('950e8400-e29b-41d4-a716-446655440006', 'PED-2025-006', NULL, NULL, NULL, NULL, 'recogida', 'tarjeta', NULL, NULL, NULL, NULL, 'en preparación', 22.40),
('950e8400-e29b-41d4-a716-446655440007', 'PED-2025-007', 'Carmen Jiménez Vega', '623456789', 'carmen.jimenez@hotmail.com', '550e8400-e29b-41d4-a716-446655440007', 'recogida', 'efectivo', NULL, NULL, NULL, NULL, 'cancelado', 0.00),
('950e8400-e29b-41d4-a716-446655440008', 'PED-2025-008', NULL, NULL, NULL, NULL, 'domicilio', 'tarjeta', 'Calle del Sol 67, 4º D', 'Sevilla', '41001', '689012345', 'entregado', 37.80);

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
    CASE 
        WHEN p.usuario_id IS NOT NULL THEN u.nombre 
        ELSE 'Cliente anónimo' 
    END AS nombre_usuario,
    CASE 
        WHEN p.usuario_id IS NOT NULL THEN u.telefono 
        ELSE p.direccion_telefono 
    END AS telefono,
    p.tipo_entrega,
    p.metodo_pago,
    CASE 
        WHEN p.tipo_entrega = 'domicilio' THEN CONCAT(p.direccion_calle, ', ', p.direccion_ciudad, ' ', p.direccion_codigo_postal)
        ELSE 'Recogida en tienda'
    END AS direccion_entrega,
    p.estado, 
    p.total,
    p.fecha_creacion,
    pr.nombre AS producto, 
    pr.precio, 
    dp.cantidad, 
    dp.subtotal 
FROM pedidos p 
LEFT JOIN usuarios u ON p.usuario_id = u.id
JOIN detalles_pedido dp ON p.id = dp.pedido_id 
JOIN productos pr ON dp.producto_id = pr.id 
ORDER BY p.fecha_creacion DESC, p.numero_pedido, pr.nombre;

-- Ver todos los productos con sus imágenes
SELECT 
    p.id AS producto_id,
    p.nombre,
    p.descripcion,
    FORMAT(p.precio, 2) AS precio,
    p.disponible,
    cp.nombre AS categoria_nombre,
    GROUP_CONCAT(i.filename) AS imagenes
FROM 
    productos p
LEFT JOIN 
    imagenes_productos i ON p.id = i.producto_id
LEFT JOIN 
    categorias_producto cp ON p.categoria_id = cp.id
GROUP BY 
    p.id, p.nombre, p.descripcion, p.precio, p.disponible, cp.nombre
ORDER BY p.nombre;

-- Consultas específicas para el nuevo modelo de pedidos

-- Ver pedidos por tipo de entrega
SELECT 
    tipo_entrega,
    COUNT(*) as total_pedidos,
    SUM(total) as facturacion_total,
    AVG(total) as ticket_promedio
FROM pedidos 
GROUP BY tipo_entrega;

-- Ver pedidos por método de pago
SELECT 
    metodo_pago,
    COUNT(*) as total_pedidos,
    SUM(total) as facturacion_total
FROM pedidos 
GROUP BY metodo_pago;

-- Ver pedidos a domicilio con direcciones completas
SELECT 
    p.numero_pedido,
    CASE 
        WHEN p.usuario_id IS NOT NULL THEN u.nombre 
        ELSE 'Cliente anónimo' 
    END AS cliente,
    CONCAT(p.direccion_calle, ', ', p.direccion_ciudad, ' ', p.direccion_codigo_postal) as direccion_completa,
    p.direccion_telefono,
    p.metodo_pago,
    p.estado,
    p.total,
    p.fecha_creacion
FROM pedidos p
LEFT JOIN usuarios u ON p.usuario_id = u.id
WHERE p.tipo_entrega = 'domicilio'
ORDER BY p.fecha_creacion DESC;

-- Ver estadísticas de pedidos por usuario registrado vs anónimo
SELECT 
    CASE 
        WHEN usuario_id IS NOT NULL THEN 'Registrado' 
        ELSE 'Anónimo' 
    END AS tipo_cliente,
    tipo_entrega,
    metodo_pago,
    COUNT(*) as cantidad_pedidos,
    SUM(total) as facturacion_total
FROM pedidos
GROUP BY 
    CASE WHEN usuario_id IS NOT NULL THEN 'Registrado' ELSE 'Anónimo' END,
    tipo_entrega,
    metodo_pago
ORDER BY tipo_cliente, tipo_entrega, metodo_pago;

-- Modificaciones para la tabla pedidos (si ya existe)
ALTER TABLE pedidos 
MODIFY COLUMN usuario_id CHAR(36) NULL,
ADD COLUMN tipo_entrega ENUM('recogida', 'domicilio') NOT NULL DEFAULT 'recogida' AFTER usuario_id,
ADD COLUMN metodo_pago ENUM('efectivo', 'tarjeta') NOT NULL DEFAULT 'efectivo' AFTER tipo_entrega,
ADD COLUMN direccion_calle VARCHAR(255) NULL AFTER metodo_pago,
ADD COLUMN direccion_ciudad VARCHAR(100) NULL AFTER direccion_calle,
ADD COLUMN direccion_codigo_postal VARCHAR(10) NULL AFTER direccion_ciudad,
ADD COLUMN direccion_telefono VARCHAR(15) NULL AFTER direccion_codigo_postal,
ADD COLUMN fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER total,
DROP FOREIGN KEY pedidos_ibfk_1,
ADD FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL;


