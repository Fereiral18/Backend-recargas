import { basename, join } from 'path';

/**
 * Turns a stored proof_image_path ("/uploads/proofs/<file>") into an absolute
 * path that is guaranteed to live inside uploads/proofs. Only the file name is
 * kept (basename), so a tampered value like "../../.env" can never escape the
 * proofs folder and expose other files from the server.
 */
export function resolveProofPath(proofImagePath: string): string {
  return join(process.cwd(), 'uploads', 'proofs', basename(proofImagePath));
}
