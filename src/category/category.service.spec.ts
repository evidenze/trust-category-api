import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { CategoryRepository } from './repositories/category.repository';
import {
  addCategoryData,
  newCategoryResponse,
  parentNotFoundData,
  saveCategoryResult,
} from './mock/category.mock';
import { HttpException, NotFoundException } from '@nestjs/common';
import { Category } from './entities/category.entity';

describe('CategoryService', () => {
  let service: CategoryService;

  const mockCategoryRepository = {
    saveCategory: jest.fn().mockResolvedValue(saveCategoryResult),
    getCategory: jest.fn().mockRejectedValue({}),
    getSubtree: jest.fn().mockRejectedValue({}),
    deleteCategory: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    mockCategoryRepository.getCategory.mockClear();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: CategoryRepository,
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addCategory', () => {
    it('should add a new category', async () => {
      const result = await service.addCategory(addCategoryData);

      expect(result).toEqual(newCategoryResponse);
      expect(mockCategoryRepository.saveCategory).toHaveBeenCalled();
    });

    it('should handle parent category not found', async () => {
      mockCategoryRepository.getCategory.mockResolvedValue(null);

      await expect(service.addCategory(parentNotFoundData)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeCategory', () => {
    const mockCategory = { id: 1, label: 'Test Category' } as Category;

    it('should delete a category successfully', async () => {
      mockCategoryRepository.getCategory.mockResolvedValue(mockCategory);
      mockCategoryRepository.deleteCategory.mockResolvedValue({ affected: 1 });

      const result = await service.removeCategory(1);

      expect(result).toEqual({
        status: true,
        message: 'Category deleted successfully',
      });
    });

    it('should throw NotFoundException if category is not found', async () => {
      mockCategoryRepository.getCategory.mockResolvedValue(null);

      await expect(service.removeCategory(123)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockCategoryRepository.getCategory).toHaveBeenCalledWith(123);
    });

    it('should throw HttpException if deletion fails (affected: 0)', async () => {
      mockCategoryRepository.getCategory.mockResolvedValue(mockCategory);
      mockCategoryRepository.deleteCategory.mockResolvedValue({ affected: 0 });

      await expect(service.removeCategory(1)).rejects.toThrow(HttpException);
      expect(mockCategoryRepository.getCategory).toHaveBeenCalledWith(1);
      expect(mockCategoryRepository.deleteCategory).toHaveBeenCalledWith(1);
    });
  });

  describe('getSubtree', () => {
    it('should return a category subtree', async () => {
      const mockCategory = {
        id: 1,
        label: 'Test Category',
        children: [],
      } as Category;

      mockCategoryRepository.getSubtree.mockResolvedValue(mockCategory);

      const result = await service.getSubtree(1);

      expect(result).toEqual({
        status: true,
        message: 'Category fetched successfully',
        data: mockCategory,
      });
    });

    it('should throw NotFoundException if category is not found', async () => {
      mockCategoryRepository.getSubtree.mockResolvedValue(null);

      await expect(service.getSubtree(123)).rejects.toThrow(NotFoundException);
      expect(mockCategoryRepository.getSubtree).toHaveBeenCalledWith(123);
    });
  });

  describe('moveSubtree', () => {
    it('should move a category subtree', async () => {
      const mockCategory = {
        id: 1,
        label: 'Test Category',
        children: [],
      } as Category;
      const mockNewParent = {
        id: 2,
        label: 'New Parent',
        children: [],
      } as Category;

      mockCategoryRepository.getCategory
        .mockResolvedValueOnce(mockCategory)
        .mockResolvedValueOnce(mockNewParent);

      mockCategoryRepository.saveCategory.mockResolvedValue(mockCategory);

      const result = await service.moveSubtree(1, 2);

      expect(result).toEqual({
        status: true,
        message: 'Category moved successfully',
        data: mockCategory,
      });
    });

    it('should throw NotFoundException if category to move is not found', async () => {
      mockCategoryRepository.getCategory.mockResolvedValueOnce(null);

      await expect(service.moveSubtree(123, 456)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockCategoryRepository.getCategory).toHaveBeenCalledWith(123);
    });

    it('should throw NotFoundException if new parent is not found', async () => {
      mockCategoryRepository.getCategory
        .mockResolvedValueOnce({ id: 1, label: 'Test Category' })
        .mockResolvedValueOnce(null);

      await expect(service.moveSubtree(123, 456)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockCategoryRepository.getCategory).toHaveBeenCalledTimes(2);
    });

    it('should throw HttpException if saving the moved category fails', async () => {
      const mockCategory = { id: 1, label: 'Test Category' } as Category;
      const mockNewParent = { id: 2, label: 'New Parent' } as Category;

      mockCategoryRepository.getCategory
        .mockResolvedValueOnce(mockCategory)
        .mockResolvedValueOnce(mockNewParent);

      mockCategoryRepository.saveCategory.mockRejectedValue(
        new HttpException(
          {
            status: false,
            message: 'An error occurred moving the category',
          },
          500,
        ),
      );

      await expect(service.moveSubtree(1, 2)).rejects.toThrow(HttpException);
      expect(mockCategoryRepository.getCategory).toHaveBeenCalledTimes(2);
      expect(mockCategoryRepository.saveCategory).toHaveBeenCalledWith(
        mockCategory,
      );
    });
  });
});
