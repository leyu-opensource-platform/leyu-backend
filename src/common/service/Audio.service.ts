import { Injectable } from '@nestjs/common';
import { parseFile } from 'music-metadata';

export interface AudioDurationBounds {
  minimumSeconds?: number | null;
  maximumSeconds?: number | null;
}

export interface AudioValidationResult {
  valid: boolean;
  duration: number;
  reason?: string;
}

@Injectable()
export class AudioService {
  /**
   * Validates an uploaded audio file by reading its real duration directly
   * from the file (server-side, via music-metadata) rather than trusting any
   * duration value supplied by the client. Optionally enforces a task's
   * minimum/maximum duration requirements.
   *
   * This guards against:
   *  - empty, corrupt, or unreadable audio uploads
   *  - client-reported durations that don't match the actual file (either
   *    from a buggy client or a spoofed value)
   *  - recordings that fall outside a task's configured duration bounds
   *
   * @param filePath Path to the audio file on local disk.
   * @param bounds Optional minimum/maximum duration (in seconds) to enforce.
   * @returns The validation outcome, including the server-verified duration.
   */
  async validateAudioFile(
    filePath: string,
    bounds: AudioDurationBounds = {},
  ): Promise<AudioValidationResult> {
    let duration: number;
    try {
      duration = await this.getAudioDuration(filePath);
    } catch {
      return {
        valid: false,
        duration: 0,
        reason:
          'Unable to read the audio file. It may be corrupt, empty, or in an unsupported format.',
      };
    }

    if (!duration || duration <= 0) {
      return {
        valid: false,
        duration: 0,
        reason:
          'The audio file appears to be empty or has no detectable audio content.',
      };
    }

    const { minimumSeconds, maximumSeconds } = bounds;

    if (minimumSeconds && duration < minimumSeconds) {
      return {
        valid: false,
        duration,
        reason: `Recording is too short (${duration.toFixed(1)}s). This task requires at least ${minimumSeconds}s.`,
      };
    }

    if (maximumSeconds && duration > maximumSeconds) {
      return {
        valid: false,
        duration,
        reason: `Recording is too long (${duration.toFixed(1)}s). This task allows at most ${maximumSeconds}s.`,
      };
    }

    return { valid: true, duration };
  }

  async getAudioDuration(filePath: string): Promise<number> {
    console.log('filepath:', filePath);
    // check file exists
    // if (!fs.existsSync(filePath)) {
    //   throw new Error(`File does not exist: ${filePath}`);
    // }

    // // check file size
    // const stats = fs.statSync(filePath);

    // if (stats.size === 0) {
    //   throw new Error('Uploaded file is empty');
    // }

    try {
      const metadata = await parseFile(filePath, {
        duration: true, // IMPORTANT for some mp3 files
      });

      console.log('metadata:', metadata.format);

      const duration = metadata.format.duration;

      if (!duration || isNaN(duration)) {
        return 0;
        // throw new Error('Unable to retrieve audio duration');
      }

      return parseFloat(duration.toFixed(4));
    } catch (error) {
      console.error('Audio metadata error:', error);
      throw error;
    }
  }
}
