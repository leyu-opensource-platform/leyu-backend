const mockParseFile = jest.fn();

// `{ virtual: true }` avoids requiring Jest to resolve the real
// 'music-metadata' package. It is an ESM-only module in this codebase
// (package.json only exposes an "import" condition), which Jest's default
// CommonJS resolver cannot load even though Node itself can require it at
// runtime. Mocking it virtually keeps this test isolated from that
// pre-existing, unrelated resolver limitation.
jest.mock(
  'music-metadata',
  () => ({
    parseFile: (...args: unknown[]): unknown => mockParseFile(...args),
  }),
  { virtual: true },
);

// Imported after the mock so AudioService picks up the mocked module.
import { AudioService } from './Audio.service';

describe('AudioService', () => {
  let service: AudioService;

  beforeEach(() => {
    service = new AudioService();
    mockParseFile.mockReset();
  });

  describe('getAudioDuration', () => {
    it('returns the duration reported by the audio parser', async () => {
      mockParseFile.mockResolvedValue({ format: { duration: 12.3456 } });

      const duration = await service.getAudioDuration('/tmp/some-file.wav');

      expect(duration).toBeCloseTo(12.3456, 3);
    });

    it('returns 0 when the parser reports no duration', async () => {
      mockParseFile.mockResolvedValue({ format: {} });

      const duration = await service.getAudioDuration('/tmp/some-file.wav');

      expect(duration).toBe(0);
    });

    it('propagates an error when the file cannot be parsed', async () => {
      mockParseFile.mockRejectedValue(new Error('bad file'));

      await expect(
        service.getAudioDuration('/tmp/corrupt-file.wav'),
      ).rejects.toThrow('bad file');
    });
  });

  describe('validateAudioFile', () => {
    const bounds = { minimumSeconds: 10, maximumSeconds: 60 };

    it('accepts a recording exactly at the minimum boundary (10s)', async () => {
      mockParseFile.mockResolvedValue({ format: { duration: 10 } });

      const result = await service.validateAudioFile('/tmp/f.wav', bounds);

      expect(result).toEqual({ valid: true, duration: 10 });
    });

    it('accepts a recording exactly at the maximum boundary (60s)', async () => {
      mockParseFile.mockResolvedValue({ format: { duration: 60 } });

      const result = await service.validateAudioFile('/tmp/f.wav', bounds);

      expect(result).toEqual({ valid: true, duration: 60 });
    });

    it('accepts a recording comfortably within bounds', async () => {
      mockParseFile.mockResolvedValue({ format: { duration: 35 } });

      const result = await service.validateAudioFile('/tmp/f.wav', bounds);

      expect(result.valid).toBe(true);
    });

    it('rejects a recording below the minimum duration', async () => {
      mockParseFile.mockResolvedValue({ format: { duration: 9.9 } });

      const result = await service.validateAudioFile('/tmp/f.wav', bounds);

      expect(result.valid).toBe(false);
      expect(result.reason).toMatch(/too short/i);
    });

    it('rejects a recording above the maximum duration', async () => {
      mockParseFile.mockResolvedValue({ format: { duration: 60.1 } });

      const result = await service.validateAudioFile('/tmp/f.wav', bounds);

      expect(result.valid).toBe(false);
      expect(result.reason).toMatch(/too long/i);
    });

    it('rejects a file with no detectable duration (empty/silent header only)', async () => {
      mockParseFile.mockResolvedValue({ format: { duration: 0 } });

      const result = await service.validateAudioFile('/tmp/f.wav', bounds);

      expect(result.valid).toBe(false);
      expect(result.duration).toBe(0);
      expect(result.reason).toMatch(/empty|no detectable/i);
    });

    it('rejects a corrupt or unreadable file', async () => {
      mockParseFile.mockRejectedValue(
        new Error('Could not determine file type'),
      );

      const result = await service.validateAudioFile('/tmp/f.wav', bounds);

      expect(result.valid).toBe(false);
      expect(result.duration).toBe(0);
      expect(result.reason).toMatch(/corrupt|unable to read/i);
    });

    it('accepts any duration when the task has no configured bounds', async () => {
      mockParseFile.mockResolvedValue({ format: { duration: 500 } });

      const result = await service.validateAudioFile('/tmp/f.wav', {});

      expect(result.valid).toBe(true);
    });

    it('only enforces the minimum when maximum is not configured', async () => {
      mockParseFile.mockResolvedValue({ format: { duration: 1000 } });

      const result = await service.validateAudioFile('/tmp/f.wav', {
        minimumSeconds: 10,
      });

      expect(result.valid).toBe(true);
    });

    it('only enforces the maximum when minimum is not configured', async () => {
      mockParseFile.mockResolvedValue({ format: { duration: 0.5 } });

      const result = await service.validateAudioFile('/tmp/f.wav', {
        maximumSeconds: 60,
      });

      expect(result.valid).toBe(true);
    });
  });
});
