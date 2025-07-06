import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { Role } from '../common/enums/rol.enum';
import { Roles } from '../common/decorators/auth.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

/**
 * Controller that handles user creation.
 * Accessible only to authenticated users with the ADMIN role.
 */
@ApiTags('Users')
@ApiBearerAuth()
@Controller('create')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a new user (admin only)' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized: Invalid or missing token',
  })
  @ApiResponse({ status: 403, description: 'Forbidden: Insufficient role' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
