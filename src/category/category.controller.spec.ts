import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/newCategory.dto';
import { HttpException, NotFoundException } from '@nestjs/common';

describe('CategoryController', () => {
  let controller: CategoryController;

  const mockCategoryService = {
    addCategory: jest.fn().mockReturnValue({}),
    removeCategory: jest.fn().mockReturnValue({}),
    getSubtree: jest.fn().mockReturnValue({}),
    moveSubtree: jest.fn().mockReturnValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [CategoryService],
    })
      .overrideProvider(CategoryService)
      .useValue(mockCategoryService)
      .compile();

    controller = module.get<CategoryController>(CategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a category', async () => {
    const mockCategoryData: CreateCategoryDto = {
      label: 'Test Category',
      parentId: null,
    };

    mockCategoryService.addCategory.mockResolvedValue({
      id: 1,
      ...mockCategoryData,
    });

    const result = await controller.create(mockCategoryData);

    expect(result).toEqual({ id: 1, ...mockCategoryData });
    expect(mockCategoryService.addCategory).toHaveBeenCalledWith(
      mockCategoryData,
    );
  });

  it('should delete a category', async () => {
    mockCategoryService.removeCategory.mockResolvedValue({
      status: true,
      message: 'Category deleted successfully',
    });

    const result = await controller.remove('123');

    expect(result).toEqual({
      status: true,
      message: 'Category deleted successfully',
    });
    expect(mockCategoryService.removeCategory).toHaveBeenCalledWith(123);
  });

  it('should return 404 if category is not found', async () => {
    mockCategoryService.removeCategory.mockRejectedValue(
      new NotFoundException(),
    );

    await expect(controller.remove('123')).rejects.toThrow(NotFoundException);
    expect(mockCategoryService.removeCategory).toHaveBeenCalledWith(123);
  });

  it('should fetch a category subtree', async () => {
    const mockCategorySubtree = {
      id: 1,
      label: 'Test Category',
      children: [],
    };

    mockCategoryService.getSubtree.mockResolvedValue(mockCategorySubtree);

    const result = await controller.findSubtree('123');

    expect(result).toEqual(mockCategorySubtree);
    expect(mockCategoryService.getSubtree).toHaveBeenCalledWith(123);
  });

  it('should return 404 if category subtree is not found', async () => {
    mockCategoryService.getSubtree.mockRejectedValue(new NotFoundException());

    await expect(controller.findSubtree('123')).rejects.toThrow(
      NotFoundException,
    );
    expect(mockCategoryService.getSubtree).toHaveBeenCalledWith(123);
  });

  it('should move a category subtree', async () => {
    mockCategoryService.moveSubtree.mockResolvedValue({
      status: true,
      message: 'Category moved successfully',
    });

    const result = await controller.moveSubtree('123', '456');

    expect(result).toEqual({
      status: true,
      message: 'Category moved successfully',
    });
    expect(mockCategoryService.moveSubtree).toHaveBeenCalledWith(123, 456);
  });

  it('should return 404 if category to move is not found', async () => {
    mockCategoryService.moveSubtree.mockRejectedValue(
      new NotFoundException('Category not found'),
    );

    await expect(controller.moveSubtree('123', '456')).rejects.toThrow(
      NotFoundException,
    );
    expect(mockCategoryService.moveSubtree).toHaveBeenCalledWith(123, 456);
  });

  it('should return 404 if new parent category is not found', async () => {
    mockCategoryService.moveSubtree.mockRejectedValue(
      new NotFoundException('New parent category not found'),
    );

    await expect(controller.moveSubtree('123', '456')).rejects.toThrow(
      NotFoundException,
    );
    expect(mockCategoryService.moveSubtree).toHaveBeenCalledWith(123, 456);
  });

  it('should handle general service errors', async () => {
    mockCategoryService.moveSubtree.mockRejectedValue(
      new HttpException('Internal Error', 500),
    );

    await expect(controller.moveSubtree('123', '456')).rejects.toThrow(
      HttpException,
    );
    expect(mockCategoryService.moveSubtree).toHaveBeenCalledWith(123, 456);
  });
});
