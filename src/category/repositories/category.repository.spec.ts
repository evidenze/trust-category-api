import { DataSource } from 'typeorm';
import { CategoryRepository } from './category.repository';
import { Category } from '../entities/category.entity';

describe('CategoryRepository', () => {
  let dataSource: DataSource;
  let repository: CategoryRepository;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'sqlite',
      database: ':memory:',
      entities: [Category],
      synchronize: true,
    });
    await dataSource.initialize();
    repository = new CategoryRepository(dataSource);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('should save and retrieve a category', async () => {
    const categoryData = { label: 'Test Category' };

    const savedCategory = await repository.saveCategory(categoryData);
    expect(savedCategory.id).toBeDefined();

    const retrievedCategory = await repository.findOne({
      where: { id: savedCategory.id },
    });
    expect(retrievedCategory).toEqual(savedCategory);
  });

  it('should return null if category is not found (getCategory)', async () => {
    const retrievedCategory = await repository.getCategory(999);
    expect(retrievedCategory).toBeNull();
  });

  it('should retrieve a category subtree', async () => {
    const parentCategory = await repository.save({ label: 'Parent' });
    const childCategory = await repository.save({
      label: 'Child',
      parent: parentCategory,
    });

    const retrievedSubtree = await repository.getSubtree(parentCategory.id);

    expect(retrievedSubtree.id).toEqual(parentCategory.id);
    expect(retrievedSubtree.children).toHaveLength(1);
    expect(retrievedSubtree.children[0]).toEqual({
      id: childCategory.id,
      label: childCategory.label,
    });
  });

  it('should delete a category', async () => {
    const category = await repository.save({ label: 'To Delete' });

    const deleteResult = await repository.deleteCategory(category.id);
    expect(deleteResult.affected).toBeGreaterThan(0);

    const retrievedCategory = await repository.findOne({
      where: { id: category.id },
    });
    expect(retrievedCategory).toBeNull();
  });
});
