import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { Public, Roles } from '../auth/auth.decorators';
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

  @Roles('super_admin', 'admin')
  @Patch(':id/availability')
  updateAvailability(@Param('id') id: string, @Body() payload: UpdateMenuItemDto) {
    return this.menuService.updateAvailability(id, payload.available);
  }
}
