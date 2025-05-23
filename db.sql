CREATE DATABASE bookmymeal;
use bookmymeal;

CREATE TABLE usuarios (
	id CHAR(36) PRIMARY KEY,
    nombre VARCHAR(100),
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
    estado ENUM('pendiente', 'confirmada', 'cancelada') DEFAULT 'pendiente',
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

-- Insertar usuarios
INSERT INTO usuarios (id, nombre, email, password, rol) VALUES
('uuid-usuario-1', 'Ana Pérez', 'ana@example.com', 'hashed_password_1', 'cliente'),
('uuid-usuario-2', 'Carlos Gómez', 'carlos@example.com', 'hashed_password_2', 'admin');

-- Insertar mesas
INSERT INTO mesas (id, numero, capacidad) VALUES
('uuid-mesa-1', 1, 4),
('uuid-mesa-2', 2, 2),
('uuid-mesa-3', 3, 6);

-- Insertar reservas
INSERT INTO reservas (id, usuario_id, mesa_id, fecha, hora, estado, personas) VALUES
('uuid-reserva-1', 'uuid-usuario-1', 'uuid-mesa-1', '2025-05-21', '19:00:00', 'pendiente', 2),
('uuid-reserva-2', 'uuid-usuario-1', 'uuid-mesa-2', '2025-05-22', '20:00:00', 'confirmada', 2);

-- Insertar productos
INSERT INTO productos (id, nombre, descripcion, precio, disponible) VALUES
('uuid-producto-1', 'Pizza Margarita', 'Pizza clásica con tomate y mozzarella', 8.99, TRUE),
('uuid-producto-2', 'Hamburguesa BBQ', 'Hamburguesa con salsa BBQ y papas', 10.50, TRUE),
('uuid-producto-3', 'Ensalada César', 'Ensalada con pollo, lechuga y aderezo César', 7.25, TRUE);

-- Insertar pedidos
INSERT INTO pedidos (id, numero_pedido, usuario_id, estado, total) VALUES
('uuid-pedido-1', 'PED-001', 'uuid-usuario-1', 'pendiente', 19.49),
('uuid-pedido-2', 'PED-002', 'uuid-usuario-2', 'en preparación', 10.50);

-- Insertar detalles de pedido
INSERT INTO detalles_pedido (id, pedido_id, producto_id, cantidad, subtotal) VALUES
('uuid-detalle-1', 'uuid-pedido-1', 'uuid-producto-1', 1, 8.99),
('uuid-detalle-2', 'uuid-pedido-1', 'uuid-producto-3', 1, 7.25),
('uuid-detalle-3', 'uuid-pedido-1', 'uuid-producto-2', 1, 3.25), -- descuento simulado
('uuid-detalle-4', 'uuid-pedido-2', 'uuid-producto-2', 1, 10.50);

-- Insertar imágenes de productos
INSERT INTO imagenes_productos (producto_id, filename) VALUES
('uuid-producto-1', 'pizza_margarita.jpg'),
('uuid-producto-2', 'hamburguesa_bbq.jpg'),
('uuid-producto-3', 'ensalada_cesar.jpg');

-- Nuevas imágenes para productos existentes
INSERT INTO imagenes_productos (producto_id, filename) VALUES
('uuid-producto-1', 'pizza_margarita_2.jpg'),
('uuid-producto-2', 'hamburguesa_bbq_2.jpg'),
('uuid-producto-3', 'ensalada_cesar_2.jpg'),
('uuid-producto-1', 'pizza_margarita_closeup.jpg');


SELECT 
                p.id AS pedido_id, 
                p.numero_pedido,
                u.nombre AS nombre_usuario,
                p.estado, 
                p.total,
                p.usuario_id, 
                pr.nombre AS producto, 
                pr.precio, 
                dp.cantidad, 
                dp.subtotal 
            FROM pedidos p 
            JOIN usuarios u ON p.usuario_id = u.id
            JOIN detalles_pedido dp ON p.id = dp.pedido_id 
            JOIN productos pr ON dp.producto_id = pr.id 
            ORDER BY p.id;

 SELECT 
                r.id AS reserva_id,
                u.nombre AS nombre_usuario,
                m.numero AS numero_mesa,
                r.fecha,
                r.hora,
                r.estado,
                r.personas
            FROM reservas r
            JOIN usuarios u ON r.usuario_id = u.id
            JOIN mesas m ON r.mesa_id = m.id
            ORDER BY r.fecha, r.hora;
            
SELECT 
    p.id AS producto_id,
    p.nombre,
    p.descripcion,
    FORMAT(p.precio, 2) AS precio,
    p.disponible,
    JSON_ARRAYAGG(i.filename) AS imagen
FROM 
    productos p
LEFT JOIN 
    imagenes_productos i ON p.id = i.producto_id
GROUP BY 
    p.id, p.nombre, p.descripcion, p.precio, p.disponible;


