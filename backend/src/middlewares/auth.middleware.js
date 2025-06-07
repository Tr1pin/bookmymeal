import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../config.js';

const KEY = process.env.SECRET_KEY || JWT_SECRET;

export const authMiddleware = (req, res, next) => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Token de acceso requerido. Formato: Bearer <token>' 
      });
    }
    
    // Extraer el token sin el prefijo 'Bearer '
    const token = authHeader.substring(7);
    
    if (!token) {
      return res.status(401).json({ 
        message: 'Token de acceso requerido' 
      });
    }
    
    // Verificar y decodificar el token
    const decoded = jwt.verify(token, KEY);
    
    // Agregar la información del usuario al request
    req.user = {
      id: decoded.id,
      role: decoded.role
    };
    
    // Continuar con el siguiente middleware
    next();
    
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token de acceso expirado' 
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Token de acceso inválido' 
      });
    } else {
      console.error('Error en authMiddleware:', error);
      return res.status(500).json({ 
        message: 'Error interno del servidor' 
      });
    }
  }
};

// Middleware para verificar que el usuario sea admin
export const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Usuario no autenticado' 
    });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Acceso denegado. Se requieren permisos de administrador' 
    });
  }
  
  next();
};

// Middleware para verificar que el usuario acceda solo a su propia información
export const ownerOrAdminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Usuario no autenticado' 
    });
  }
  
  // Los admins pueden acceder a cualquier información
  if (req.user.role === 'admin') {
    return next();
  }
  
  // Los usuarios normales solo pueden acceder a su propia información
  const userId = req.params.id || req.body.id;
  
  if (userId !== req.user.id) {
    return res.status(403).json({ 
      message: 'Acceso denegado. Solo puedes acceder a tu propia información' 
    });
  }
  
  next();
}; 