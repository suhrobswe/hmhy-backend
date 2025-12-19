import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Admin')
@Controller('admin')
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
  @Get()
  findAll() {
    return this.adminService.findAll();
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
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminService.findOneById(id);
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
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
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
  remove(@Param('id') id: string) {
    return this.adminService.delete(id);
  }
}
