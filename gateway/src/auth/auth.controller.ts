import { Body, Controller, Post, Inject} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthEntity } from './entities/auth.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError, throwError } from 'rxjs';


@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private authClient: ClientProxy,
  ) { }

  @Post('login')
  @ApiOkResponse({ type: AuthEntity })
  login(@Body() loginDto: LoginDto) {
    return this.authClient.send('login', loginDto)
    .pipe(catchError(error => throwError(() => new RpcException(error.response))));
  }

  @Post('register')
  @ApiOkResponse({ type: AuthEntity })
  register(@Body() registerDto: RegisterDto) {
    return this.authClient.send('register', registerDto)
    .pipe(catchError(error => throwError(() => new RpcException(error.response))));
  }
}
