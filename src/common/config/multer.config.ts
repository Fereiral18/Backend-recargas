import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Configuración de Multer para subida de archivos
 * Guarda en uploads/proofs/ con nombre único
 */
export const multerConfig = {
  storage: diskStorage({
    destination: './uploads/proofs',
    filename: (req, file, callback) => {
      // Generar nombre único: uuid + timestamp + extensión original
      const uniqueName = `${uuidv4()}-${Date.now()}${extname(file.originalname)}`;
      callback(null, uniqueName);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  },
  fileFilter: (req: any, file: any, callback: any) => {
    // Solo permitir imágenes
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error('Solo se permiten imágenes (jpeg, png, gif, webp)'), false);
    }
  },
};
