import { DataSource, DeleteResult, Equal, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Category } from '../entities/category.entity';
import { CategoryInterface } from '../interface/category.interface';

@Injectable()
export class CategoryRepository extends Repository<Category> {
  constructor(dataSource: DataSource) {
    super(Category, dataSource.createEntityManager());
  }

  /**
   * Saves a category to the database.
   * @param data The category data to be saved.
   * @returns A Promise resolving to the saved category.
   */
  async saveCategory(data: CategoryInterface): Promise<Category> {
    return await this.save(data);
  }

  /**
   * Retrieves a category from the database by its ID.
   * @param id The ID of the category to retrieve.
   * @returns A Promise resolving to the retrieved category.
   */
  async getCategory(id: number): Promise<Category> {
    return await this.findOne({
      where: { id: Equal(id) },
    });
  }

  /**
   * Retrieves a category and its subtree from the database by its parent ID.
   * @param parentId The ID of the parent category.
   * @returns A Promise resolving to the retrieved category and its subtree.
   */
  async getSubtree(parentId: number): Promise<Category> {
    return await this.findOne({
      where: { id: parentId },
      relations: ['children'],
    });
  }

  /**
   * Deletes a category from the database by its ID.
   * @param id The ID of the category to delete.
   * @returns A Promise resolving to the delete result.
   */
  async deleteCategory(id: number): Promise<DeleteResult> {
    return await this.delete(id);
  }
}
