import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { Public, Roles } from '../auth/auth.decorators';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { MenuService } from './menu.service';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Public()
  @Get()
  findAll() {
    return this.menuService.getMenu();
  }

  @Roles('super_admin', 'admin', 'chef')
  @Post()
  create(@Req() request: { user: { id: string } }, @Body() payload: CreateMenuItemDto) {
    return this.menuService.create(request.user.id, payload);
  }

  @Roles('super_admin', 'admin', 'chef')
  @Patch(':id/availability')
  updateAvailability(@Param('id') id: string, @Body() payload: UpdateMenuItemDto) {
    return this.menuService.updateAvailability(id, payload.available);
  }
}
