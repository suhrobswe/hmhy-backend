import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  NotFoundException,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { RolesGuard } from 'src/common/guard/role.guard';
import { Roles } from 'src/common/enum/index.enum';
import { AccessRoles } from 'src/common/decorator/roles.decorator';
import type { IToken } from 'src/infrastructure/token/interface';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { Not } from 'typeorm';
import { ChangePasswordDto } from '../teacher/dto/change-password.dto';
import { UpdateTeacherDto } from '../teacher/dto/update-teacher.dto';
import { stringToBytes } from 'node_modules/uuid/dist/v35';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@ApiTags('Admin')
@Controller('admin')
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiOperation({ summary: 'Create a new admin' })
  @ApiBody({ type: CreateAdminDto })
  @ApiResponse({
    status: 201,
    description: 'Admin created successfully',
    schema: {
      example: {
        status: 'success',
        data: {
          id: '1',
          username: 'suhrob',
          phoneNumber: '+998901234567',
          role: 'ADMIN',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    schema: { example: { status: 'error', message: 'Validation failed' } },
  })
  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.SUPER_ADMIN)
  @Post()
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.createAdmin(createAdminDto);
  }

  @ApiOperation({ summary: 'Get all admins' })
  @ApiResponse({
    status: 200,
    description: 'List of admins',
    schema: {
      example: {
        status: 'success',
        data: [
          {
            id: '1',
            username: 'suhrob',
            phoneNumber: '+998901234567',
            role: 'ADMIN',
          },
        ],
      },
    },
  })
  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.SUPER_ADMIN)
  @Get()
  findAll(@Query() query: PaginationDto) {
    return this.adminService.findAllWithPagination({
      page: query.page,
      limit: query.limit,
      select: {
        id: true,
        phoneNumber: true,
        username: true,
        role: true,
      },
      relations: [],
    });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.SUPER_ADMIN, Roles.ADMIN)
  @Patch('update')
  updateMe(@CurrentUser() user: IToken, @Body() dto: UpdateAdminDto) {
    return this.adminService.updateAdminMe(user.id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.SUPER_ADMIN, Roles.ADMIN)
  @Patch('changePassword')
  changePassword(@CurrentUser() user: IToken, @Body() dto: ChangePasswordDto) {
    return this.adminService.changePassword(user.id, dto);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.SUPER_ADMIN, Roles.ADMIN)
  getMe(@CurrentUser() user: IToken) {
    return this.adminService.findOneById(user.id, {
      select: {
        id: true,
        phoneNumber: true,
        username: true,
        role: true,
      },
      relations: [],
    });
  }

  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.SUPER_ADMIN, Roles.ADMIN)
  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @ApiOperation({ summary: 'Get admin by ID' })
  @ApiResponse({
    status: 200,
    description: 'Admin found',
    schema: {
      example: {
        status: 'success',
        data: {
          id: '1',
          username: 'suhrob',
          phoneNumber: '+998901234567',
          role: 'ADMIN',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Admin not found',
    schema: { example: { status: 'error', message: 'Admin not found' } },
  })
  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.SUPER_ADMIN, 'ID')
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.findOneById(id, {
      select: {
        id: true,
        phoneNumber: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      relations: [],
    });
  }

  @ApiOperation({ summary: 'Update admin by ID' })
  @ApiBody({ type: UpdateAdminDto })
  @ApiResponse({
    status: 200,
    description: 'Admin updated successfully',
    schema: {
      example: {
        status: 'success',
        data: {
          id: '1',
          username: 'suhrob_updated',
          phoneNumber: '+998901234567',
          role: 'ADMIN',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    schema: { example: { status: 'error', message: 'Validation failed' } },
  })
  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.SUPER_ADMIN, 'ID')
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAdminDto: UpdateAdminDto,
  ) {
    return this.adminService.updateAdmin(updateAdminDto, id);
  }

  @ApiOperation({ summary: 'Delete admin by ID' })
  @ApiResponse({
    status: 200,
    description: 'Admin deleted successfully',
    schema: {
      example: { status: 'success', message: 'Admin deleted' },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Admin not found',
    schema: { example: { status: 'error', message: 'Admin not found' } },
  })
  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.SUPER_ADMIN)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.adminService.findOneById(id, {
      where: { role: Not(Roles.SUPER_ADMIN) },
      relations: [],
    });
    if (data) return this.adminService.delete(id);

    throw new NotFoundException('Admin not found');
  }
}
