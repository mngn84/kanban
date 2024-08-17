import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  IsEmail,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MaxLength(10)
  @ApiProperty()
  name: string;
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @ApiProperty()
  password: string;
}
