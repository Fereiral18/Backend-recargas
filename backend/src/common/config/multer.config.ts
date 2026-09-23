import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { open, unlink } from 'fs/promises';

/**
 * Allowed image types -> the extension we save them with. The extension is
 * always derived from here, never from the client's original filename, so an
 * upload can't end up stored as e.g. "x.html" or "x.svg".
 */
const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
};

/**
 * Configuración de Multer para subida de archivos
 * Guarda en uploads/proofs/ con nombre único
 */
export const multerConfig = {
  storage: diskStorage({
    destination: './uploads/proofs',
    filename: (req, file, callback) => {
      // Nombre único: uuid + timestamp + extensión según el tipo MIME
      const extension = ALLOWED_IMAGE_TYPES[file.mimetype];
      callback(null, `${uuidv4()}-${Date.now()}${extension}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
    files: 1,
  },
  fileFilter: (req: any, file: any, callback: any) => {
    // Solo permitir imágenes (primer filtro, por el MIME que declara el cliente)
    if (ALLOWED_IMAGE_TYPES[file.mimetype]) {
      callback(null, true);
    } else {
      callback(new BadRequestException('Solo se permiten imágenes (jpeg, png, gif, webp)'), false);
    }
  },
};

/** Returns the real image type from the file's first bytes, or null if it's none of the allowed ones. */
function detectImageType(header: Buffer): string | null {
  if (header.length >= 3 && header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff) {
    return 'image/jpeg';
  }

  if (header.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return 'image/png';
  }

  const ascii = header.toString('ascii', 0, 12);

  if (ascii.startsWith('GIF87a') || ascii.startsWith('GIF89a')) {
    return 'image/gif';
  }

  if (ascii.startsWith('RIFF') && ascii.slice(8, 12) === 'WEBP') {
    return 'image/webp';
  }

  return null;
}

/**
 * Second check, after Multer saved the file: the MIME type in fileFilter is
 * whatever the client claims, so this reads the file's actual magic bytes
 * and deletes it (rejecting the request) unless it really is the image type
 * it claimed to be.
 */
export async function assertUploadedImage(file: Express.Multer.File): Promise<void> {
  let header = Buffer.alloc(0);
  const handle = await open(file.path, 'r');

  try {
    const buffer = Buffer.alloc(12);
    const { bytesRead } = await handle.read(buffer, 0, 12, 0);
    header = buffer.subarray(0, bytesRead);
  } finally {
    await handle.close();
  }

  if (detectImageType(header) !== file.mimetype) {
    await unlink(file.path).catch(() => undefined);
    throw new BadRequestException('El archivo no es una imagen válida (jpeg, png, gif, webp)');
  }
}
