import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorators';
import { EditUserDto } from './dto';
import { UserService } from './user.service';

type User = {
  sub: string;
  email: string;
};

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  @Get('me')
  async getMe(@GetUser() user: User) {
    return this.userService.findUserById(user.sub);
  }

  @Patch()
  async editUser(@GetUser('sub') id: string, @Body() dto: EditUserDto) {
    return this.userService.editUser(id, dto);
  }
}
