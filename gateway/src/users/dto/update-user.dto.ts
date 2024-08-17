import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsString, MaxLength, MinLength, IsEmail } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsString()
  @MaxLength(10)
  @ApiProperty()
  name: string;
  @IsEmail()
  @ApiProperty()
  email: string;
  @IsString()
  @MinLength(8)
  @ApiProperty()
  password: string;
}
