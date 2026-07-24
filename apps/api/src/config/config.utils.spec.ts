import {
  parseOptionalPositiveInt,
  resolveFromWorkingDirectory,
} from '@/config/config.utils';
import { resolve } from 'node:path';

describe('config utils', () => {
  it.each([
    [undefined, null],
    ['', null],
    ['0', null],
    ['-1', null],
    ['invalid', null],
    ['42', 42],
  ])('parses optional positive integer %p', (value, expected) => {
    expect(parseOptionalPositiveInt(value)).toBe(expected);
  });

  it('resolves relative paths from the working directory', () => {
    expect(resolveFromWorkingDirectory('./storage')).toBe(
      resolve(process.cwd(), './storage'),
    );
  });

  it('preserves absolute paths', () => {
    expect(resolveFromWorkingDirectory('/app/storage')).toBe('/app/storage');
  });
});
