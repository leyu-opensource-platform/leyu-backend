import { MigrationInterface, QueryRunner } from 'typeorm';

// The three positive quality tags seeded by 1786520000000-AddPositiveAnnotations.
// Everything else in setting.annotation is a quality *issue* (the original
// 1786500000000 seed set), so those default to 'negative'.
const POSITIVE_ANNOTATION_IDS = [
  '92e676cb-517f-4c4a-9546-5d586fc14da6', // Good Audio Quality
  '92e676cb-517f-4c4a-9546-5d586fc14da7', // Clear Pronunciation
  '92e676cb-517f-4c4a-9546-5d586fc14da8', // Natural Speech
];

export class AddAnnotationSentiment1786580000000 implements MigrationInterface {
  name = 'AddAnnotationSentiment1786580000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add the polarity column (idempotent so a re-run / partial deploy is safe).
    await queryRunner.query(
      `ALTER TABLE "setting"."annotation" ADD COLUMN IF NOT EXISTS "sentiment" character varying`,
    );

    // Backfill: default every existing annotation to 'negative' (the pre-existing
    // seed set was entirely quality-issue categories)...
    await queryRunner.query(
      `UPDATE "setting"."annotation" SET "sentiment" = 'negative' WHERE "sentiment" IS NULL`,
    );

    // ...then flip the known positive tags to 'positive'. The Approve dialog shows
    // only 'positive' annotations; Reject keeps using the rejection-reason list.
    await queryRunner.query(
      `UPDATE "setting"."annotation" SET "sentiment" = 'positive' WHERE "id" = ANY($1::uuid[])`,
      [POSITIVE_ANNOTATION_IDS],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "setting"."annotation" DROP COLUMN IF EXISTS "sentiment"`,
    );
  }
}
