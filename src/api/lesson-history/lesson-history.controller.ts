import { Controller, Get, Param, Delete, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LessonHistoryService } from './lesson-history.service';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { RolesGuard } from 'src/common/guard/role.guard';
import { AccessRoles } from 'src/common/decorator/roles.decorator';
import { Roles } from 'src/common/enum/index.enum';

@ApiTags('Lesson History')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('lesson-history')
export class LessonHistoryController {
  constructor(private readonly lessonHistoryService: LessonHistoryService) {}

  @Get()
  @ApiOperation({ summary: 'Barcha dars tarixlarini olish' })
  @AccessRoles(Roles.ADMIN, Roles.SUPER_ADMIN, 'ID')
  findAll() {
    return this.lessonHistoryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Bitta dars tarixini olish' })
  @AccessRoles(Roles.ADMIN, Roles.SUPER_ADMIN, 'ID')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.lessonHistoryService.findOneById(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: "Dars tarixini o'chirish" })
  @AccessRoles(Roles.ADMIN, Roles.SUPER_ADMIN, 'ID')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.lessonHistoryService.delete(id);
  }
}
