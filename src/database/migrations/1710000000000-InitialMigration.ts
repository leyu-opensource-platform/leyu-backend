import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1710000000000 implements MigrationInterface {
  name = 'InitialMigration1710000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── Create schemas ───────────────────────────────────────────────
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "setting"`);
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "task_distribution"`);

    // ─── task_distribution schema ENUMs (used in next migration) ─────
    await queryRunner.query(
      `CREATE TYPE "task_distribution"."contributor_micro_tasks_status_enum" AS ENUM('New', 'InProgress', 'Completed')`,
    );
    await queryRunner.query(
      `CREATE TYPE "task_distribution"."score_log_action_enum" AS ENUM('SUBMIT', 'ACCEPT', 'REJECT')`,
    );

    // ─── setting schema tables ─────────────────────────────────────────

    await queryRunner.query(`
      CREATE TABLE "setting"."country" (
        "id"           uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "name"         character varying NOT NULL,
        "code"         character varying,
        "continent"    character varying,
        "created_by"   character varying,
        "updated_by"   character varying,
        "created_date" TIMESTAMP         NOT NULL DEFAULT now(),
        "updated_date" TIMESTAMP         NOT NULL DEFAULT now(),
        "deletedAt"    TIMESTAMP,
        CONSTRAINT "UQ_setting_country_name" UNIQUE ("name"),
        CONSTRAINT "PK_setting_country" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "setting"."region" (
        "id"           uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "name"         character varying NOT NULL,
        "description"  character varying,
        "created_by"   character varying,
        "updated_by"   character varying,
        "created_date" TIMESTAMP         NOT NULL DEFAULT now(),
        "updated_date" TIMESTAMP         NOT NULL DEFAULT now(),
        "country_id"   uuid,
        "deletedAt"    TIMESTAMP,
        CONSTRAINT "UQ_setting_region_name" UNIQUE ("name"),
        CONSTRAINT "PK_setting_region" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "setting"."zone" (
        "id"           uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "name"         character varying NOT NULL,
        "created_by"   character varying,
        "updated_by"   character varying,
        "created_date" TIMESTAMP         NOT NULL DEFAULT now(),
        "updated_date" TIMESTAMP         NOT NULL DEFAULT now(),
        "region_id"    uuid              NOT NULL,
        "deletedAt"    TIMESTAMP,
        CONSTRAINT "UQ_setting_zone_name" UNIQUE ("name"),
        CONSTRAINT "PK_setting_zone" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "setting"."language" (
        "id"           uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "name"         character varying NOT NULL,
        "code"         character varying,
        "created_by"   character varying,
        "updated_by"   character varying,
        "created_date" TIMESTAMP         NOT NULL DEFAULT now(),
        "updated_date" TIMESTAMP         NOT NULL DEFAULT now(),
        "deletedAt"    TIMESTAMP,
        CONSTRAINT "UQ_setting_language_name" UNIQUE ("name"),
        CONSTRAINT "UQ_setting_language_code" UNIQUE ("code"),
        CONSTRAINT "PK_setting_language" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "setting"."dialect" (
        "id"           uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "name"         character varying NOT NULL,
        "description"  character varying,
        "created_by"   character varying,
        "updated_by"   character varying,
        "created_date" TIMESTAMP         NOT NULL DEFAULT now(),
        "updated_date" TIMESTAMP         NOT NULL DEFAULT now(),
        "language_id"  uuid,
        "deletedAt"    TIMESTAMP,
        CONSTRAINT "UQ_setting_dialect_name" UNIQUE ("name"),
        CONSTRAINT "PK_setting_dialect" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "setting"."sector" (
        "id"           uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "name"         character varying NOT NULL,
        "description"  character varying,
        "created_date" TIMESTAMP         NOT NULL DEFAULT now(),
        "updated_date" TIMESTAMP         NOT NULL DEFAULT now(),
        "deletedAt"    TIMESTAMP,
        CONSTRAINT "UQ_setting_sector_name" UNIQUE ("name"),
        CONSTRAINT "PK_setting_sector" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "setting"."organization" (
        "id"           uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "name"         character varying NOT NULL,
        "email"        character varying NOT NULL,
        "phone"        character varying NOT NULL,
        "address"      character varying NOT NULL,
        "created_date" TIMESTAMP         NOT NULL DEFAULT now(),
        "updated_date" TIMESTAMP         NOT NULL DEFAULT now(),
        "deletedAt"    TIMESTAMP,
        CONSTRAINT "UQ_setting_organization_name"  UNIQUE ("name"),
        CONSTRAINT "UQ_setting_organization_email" UNIQUE ("email"),
        CONSTRAINT "PK_setting_organization" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "setting"."rejection_type" (
        "id"           uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "name"         character varying NOT NULL,
        "description"  character varying NOT NULL,
        "created_by"   character varying,
        "updated_by"   character varying,
        "created_date" TIMESTAMP         NOT NULL DEFAULT now(),
        "updated_date" TIMESTAMP         NOT NULL DEFAULT now(),
        "deletedAt"    TIMESTAMP,
        CONSTRAINT "UQ_setting_rejection_type_name" UNIQUE ("name"),
        CONSTRAINT "PK_setting_rejection_type" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "setting"."flag_type" (
        "id"           uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "name"         character varying NOT NULL,
        "description"  character varying NOT NULL,
        "created_by"   character varying,
        "updated_by"   character varying,
        "created_date" TIMESTAMP         NOT NULL DEFAULT now(),
        "updated_date" TIMESTAMP         NOT NULL DEFAULT now(),
        "deletedAt"    TIMESTAMP,
        CONSTRAINT "UQ_setting_flag_type_name" UNIQUE ("name"),
        CONSTRAINT "PK_setting_flag_type" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "setting"."annotation_type" (
        "id"           uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "name"         character varying NOT NULL,
        "description"  character varying NOT NULL,
        "created_by"   character varying,
        "updated_by"   character varying,
        "created_date" TIMESTAMP         NOT NULL DEFAULT now(),
        "updated_date" TIMESTAMP         NOT NULL DEFAULT now(),
        "deletedAt"    TIMESTAMP,
        CONSTRAINT "UQ_setting_annotation_type_name" UNIQUE ("name"),
        CONSTRAINT "PK_setting_annotation_type" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "setting"."annotation" (
        "id"                  uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "name"                character varying NOT NULL,
        "description"         character varying NOT NULL,
        "created_by"          character varying,
        "updated_by"          character varying,
        "created_date"        TIMESTAMP         NOT NULL DEFAULT now(),
        "updated_date"        TIMESTAMP         NOT NULL DEFAULT now(),
        "deletedAt"           TIMESTAMP,
        "annotation_type_id"  uuid,
        CONSTRAINT "UQ_setting_annotation_name" UNIQUE ("name"),
        CONSTRAINT "PK_setting_annotation" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "setting"."annotation"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "setting"."annotation_type"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "setting"."flag_type"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "setting"."rejection_type"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "setting"."organization"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "setting"."sector"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "setting"."dialect"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "setting"."language"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "setting"."zone"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "setting"."region"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "setting"."country"`);
    await queryRunner.query(
      `DROP SCHEMA IF EXISTS "task_distribution" CASCADE`,
    );
    await queryRunner.query(`DROP SCHEMA IF EXISTS "setting" CASCADE`);
  }
}
