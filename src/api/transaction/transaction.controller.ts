import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { RolesGuard } from 'src/common/guard/role.guard';
import { AccessRoles } from 'src/common/decorator/roles.decorator';
import { Roles } from 'src/common/enum/index.enum';

@ApiTags('Transactions')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @AccessRoles(Roles.ADMIN, Roles.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create transaction' })
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionService.create(createTransactionDto);
  }

  @Get()
  @AccessRoles(Roles.ADMIN, Roles.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all transactions' })
  findAll() {
    return this.transactionService.findAll();
  }

  @Get('stats')
  @AccessRoles(Roles.ADMIN, Roles.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get payment statistics' })
  getStats() {
    return this.transactionService.getStats();
  }

  @Get(':id')
  @AccessRoles(Roles.ADMIN, Roles.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get one transaction' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.transactionService.findOne(id);
  }

  @Patch(':id')
  @AccessRoles(Roles.ADMIN, Roles.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update transaction' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return this.transactionService.update(id, updateTransactionDto);
  }

  @Delete(':id')
  @AccessRoles(Roles.ADMIN, Roles.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete transaction' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.transactionService.remove(id);
  }
}
