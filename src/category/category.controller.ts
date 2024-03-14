import {
  Controller,
  Post,
  Body,
  Delete,
  Param,
  Get,
  Patch,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/newCategory.dto';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  async create(@Body() body: CreateCategoryDto) {
    return this.categoryService.addCategory(body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.categoryService.removeCategory(+id);
  }

  @Get(':parentId/subtree')
  async findSubtree(@Param('parentId') parentId: string) {
    return this.categoryService.getSubtree(+parentId);
  }

  @Patch(':id/move/:newParentId')
  async moveSubtree(
    @Param('id') id: string,
    @Param('newParentId') newParentId: string,
  ) {
    return this.categoryService.moveSubtree(+id, +newParentId);
  }
}
