import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { Permission } from '../entities/Permission.entity';
@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  /**
   * Retrieves a single permission from the database.
   * @param query The query to filter permissions. Supports relations.
   * @param queryRunner The query runner to use for the query.
   * @returns A promise resolving to the permission if found, or null.
   */
  async findOne(
    query: any,
    queryRunner?: QueryRunner,
  ): Promise<Permission | null> {
    if (queryRunner) {
      const manager = queryRunner.manager;
      return await manager.findOne(Permission, {
        where: query,
        relations: ['role'],
      });
    } else {
      const manager = this.permissionRepository;
      return await manager.findOne({ where: query });
    }
  }
  /**
   * Retrieves multiple permissions from the database.
   * @param query The query to filter permissions.
   * @param queryRunner The query runner to use for the query.
   * @returns A promise resolving to an array of permissions matching the query.
   */
  async findMany(query: any, queryRunner?: QueryRunner): Promise<Permission[]> {
    if (queryRunner) {
      const manager = queryRunner.manager;
      return await manager.find(Permission, { where: query });
    } else {
      const manager = this.permissionRepository;
      return await manager.find({ where: query });
    }
  }
  /**
   * Creates a new permission in the database.
   * @param userData The partial permission data to create.
   * @param queryRunner The query runner to use for the query.
   * @returns A promise resolving to the created permission.
   */
  async create(
    userData: Partial<Permission>,
    queryRunner?: QueryRunner,
  ): Promise<Permission> {
    if (queryRunner) {
      const manager = queryRunner.manager;
      const user = manager.create(Permission, userData);
      return await manager.save(Permission, user);
    } else {
      const manager = this.permissionRepository;
      const user = manager.create(userData);
      return await manager.save(user);
    }
  }
  /**
   * Updates a permission in the database.
   * @param id The id of the permission to update.
   * @param userData The partial permission data to update.
   * @param queryRunner The query runner to use for the query.
   * @returns A promise resolving to the updated permission if found, or null.
   */
  async update(
    id: any,
    userData: Partial<Permission>,
    queryRunner?: QueryRunner,
  ): Promise<Permission | null> {
    if (queryRunner) {
      const manager = queryRunner.manager;
      await manager.update(Permission, id, userData);
      return await manager.findOne(Permission, { where: id });
    } else {
      const manager = this.permissionRepository;
      return await manager.save(userData);
    }
  }
  /**
   * Deletes a permission from the database.
   * @param id The id of the permission to delete.
   * @param queryRunner The query runner to use for the query.
   * @returns A promise resolving to true if the permission was deleted, false otherwise.
   */
  async deletePermission(id: any, queryRunner?: QueryRunner): Promise<boolean> {
    if (queryRunner) {
      const manager = queryRunner.manager;
      await manager.delete(Permission, { id: id });
      return true;
    } else {
      const manager = this.permissionRepository;
      await manager.delete(id);
      return true;
    }
  }
}
