import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { Category } from './entities/category.entity';
import { CategoryRepository } from './repositories/category.repository';
import { DeleteResult } from 'typeorm';
import { CategoryInterface } from './interface/category.interface';

@Injectable()
export class CategoryService {
  constructor(private categoryRepository: CategoryRepository) {}

  /**
   * Create a new category.
   *
   * @param data - Object containing label and parentId for the new category
   * @returns {object} - Object containing status, message, and data of the created category
   */
  async addCategory(data: CategoryInterface): Promise<any> {
    const { label, parentId } = data;
    const category = new Category();
    category.label = label;

    if (parentId) {
      const parent: Category =
        await this.categoryRepository.getCategory(parentId);

      if (!parent) throw new NotFoundException('Parent category not found');
      category.parent = parent;
    }

    const saveCategory: Category =
      await this.categoryRepository.saveCategory(category);

    if (saveCategory) {
      return {
        status: true,
        message: 'Category created successfully',
        data: saveCategory,
      };
    }

    throw new HttpException(
      {
        status: false,
        message: 'An error occurred creating the category',
      },
      500,
    );
  }

  /**
   * Delete a category.
   *
   * @param id - ID of the category to be deleted
   * @returns {object} - Object containing status and message of the deletion operation
   */
  async removeCategory(id: number): Promise<any> {
    const category: Category = await this.categoryRepository.getCategory(id);

    if (!category) throw new NotFoundException('Category not found');

    const deleteCategory: DeleteResult =
      await this.categoryRepository.deleteCategory(id);

    if (deleteCategory.affected === 1) {
      return {
        status: true,
        message: 'Category deleted successfully',
      };
    }

    throw new HttpException(
      {
        status: false,
        message: 'An error occurred deleting the category',
      },
      500,
    );
  }

  /**
   * Get subtree category.
   *
   * @param parentId - ID of the parent category
   * @returns {object} - Object containing status, message, and data of the fetched category subtree
   */
  async getSubtree(parentId: number): Promise<any> {
    const category: Category =
      await this.categoryRepository.getSubtree(parentId);

    if (!category) throw new NotFoundException('Category not found');

    return {
      status: true,
      message: 'Category fetched successfully',
      data: category,
    };
  }

  /**
   * Move subtree category.
   *
   * @param id - ID of the category to be moved
   * @param newParentId - ID of the new parent category
   * @returns {object} - Object containing status, message, and data of the moved category
   */
  async moveSubtree(id: number, newParentId: number): Promise<any> {
    const category: Category = await this.categoryRepository.getCategory(id);

    if (!category) throw new NotFoundException('Category not found');

    const newParent: Category =
      await this.categoryRepository.getCategory(newParentId);

    if (!newParent)
      throw new NotFoundException('New parent category not found');

    category.parent = newParent;
    const moveCategory: Category =
      await this.categoryRepository.saveCategory(category);

    if (moveCategory) {
      return {
        status: true,
        message: 'Category moved successfully',
        data: moveCategory,
      };
    }

    throw new HttpException(
      {
        status: false,
        message: 'An error occurred moving the category',
      },
      500,
    );
  }
}
