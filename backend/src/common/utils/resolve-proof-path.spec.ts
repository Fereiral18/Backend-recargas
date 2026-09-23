import { join } from 'path';
import { resolveProofPath } from './resolve-proof-path';

describe('resolveProofPath', () => {
  const proofsDir = join(process.cwd(), 'uploads', 'proofs');

  it('should resolve a normal stored path inside uploads/proofs', () => {
    expect(resolveProofPath('/uploads/proofs/abc-123.webp')).toBe(join(proofsDir, 'abc-123.webp'));
  });

  it.each(['../../.env', '/uploads/proofs/../../.env', '../../../etc/passwd', '/etc/passwd'])(
    'should never escape uploads/proofs for a tampered path (%s)',
    (tampered) => {
      const resolved = resolveProofPath(tampered);

      expect(resolved.startsWith(proofsDir)).toBe(true);
      expect(resolved).not.toBe(join(process.cwd(), '.env'));
    },
  );
});
