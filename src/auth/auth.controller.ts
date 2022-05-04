import {
  Body,
  Controller,
  HttpCode,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDTO } from './dto';

//Receives request from internet, calls service function and sends response back to the internet.
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signUp(@Body(ValidationPipe) dto: AuthDTO) {
    return this.authService.signUp(dto);
  }

  @HttpCode(200)
  @Post('signin')
  signIn(@Body(ValidationPipe) dto: AuthDTO) {
    return this.authService.signIn(dto);
  }
}
