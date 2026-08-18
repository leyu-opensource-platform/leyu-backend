import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMicroTaskReport1786400000000 implements MigrationInterface {
  name = 'AddMicroTaskReport1786400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "micro_task" ADD "is_reported" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."micro_task_report_reason_enum" AS ENUM('nonsensical', 'offensive', 'other')`,
    );
    await queryRunner.query(
      `CREATE TABLE "micro_task_report" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "micro_task_id" uuid NOT NULL, "reported_by" uuid NOT NULL, "reason" "public"."micro_task_report_reason_enum" NOT NULL, "note" character varying, "created_date" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_micro_task_report_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "micro_task_report" ADD CONSTRAINT "FK_micro_task_report_micro_task" FOREIGN KEY ("micro_task_id") REFERENCES "micro_task"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "micro_task_report" ADD CONSTRAINT "FK_micro_task_report_user" FOREIGN KEY ("reported_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "micro_task_report" DROP CONSTRAINT "FK_micro_task_report_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "micro_task_report" DROP CONSTRAINT "FK_micro_task_report_micro_task"`,
    );
    await queryRunner.query(`DROP TABLE "micro_task_report"`);
    await queryRunner.query(
      `DROP TYPE "public"."micro_task_report_reason_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "micro_task" DROP COLUMN "is_reported"`,
    );
  }
}
