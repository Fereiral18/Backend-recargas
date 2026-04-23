"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.multerConfig = void 0;
const multer_1 = require("multer");
const path_1 = require("path");
const uuid_1 = require("uuid");
exports.multerConfig = {
    storage: (0, multer_1.diskStorage)({
        destination: './uploads/proofs',
        filename: (req, file, callback) => {
            const uniqueName = `${(0, uuid_1.v4)()}-${Date.now()}${(0, path_1.extname)(file.originalname)}`;
            callback(null, uniqueName);
        },
    }),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, callback) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedMimes.includes(file.mimetype)) {
            callback(null, true);
        }
        else {
            callback(new Error('Solo se permiten imágenes (jpeg, png, gif, webp)'), false);
        }
    },
};
//# sourceMappingURL=multer.config.js.map