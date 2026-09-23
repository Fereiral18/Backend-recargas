import { BadRequestException } from '@nestjs/common';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { assertUploadedImage } from './multer.config';

describe('assertUploadedImage', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'upload-test-'));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  function upload(name: string, content: Buffer, mimetype: string) {
    const path = join(dir, name);
    writeFileSync(path, content);
    return { path, mimetype } as Express.Multer.File;
  }

  const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
  const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const GIF = Buffer.from('GIF89a......', 'ascii');
  const WEBP = Buffer.from('RIFF\0\0\0\0WEBP', 'ascii');

  it.each([
    ['image/png', PNG],
    ['image/jpeg', JPEG],
    ['image/gif', GIF],
    ['image/webp', WEBP],
  ])('should accept a real %s file', async (mimetype, content) => {
    const file = upload('ok', content, mimetype);

    await expect(assertUploadedImage(file)).resolves.toBeUndefined();
    expect(existsSync(file.path)).toBe(true);
  });

  it('should reject and delete an HTML file disguised as image/png', async () => {
    const file = upload('evil', Buffer.from('<script>alert(1)</script>'), 'image/png');

    await expect(assertUploadedImage(file)).rejects.toThrow(BadRequestException);
    expect(existsSync(file.path)).toBe(false);
  });

  it('should reject a real image whose content does not match the declared type', async () => {
    const file = upload('mismatch', JPEG, 'image/png');

    await expect(assertUploadedImage(file)).rejects.toThrow(BadRequestException);
    expect(existsSync(file.path)).toBe(false);
  });

  it('should reject an empty file', async () => {
    const file = upload('empty', Buffer.alloc(0), 'image/jpeg');

    await expect(assertUploadedImage(file)).rejects.toThrow(BadRequestException);
  });
});
