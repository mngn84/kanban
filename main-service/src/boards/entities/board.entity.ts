import { Board } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";
import { UserEntity } from "src/users/entities/user.entity";
import { Exclude } from 'class-transformer';

export class BoardEntity implements Board {
    constructor(partial: Partial<BoardEntity>) {
        Object.assign(this, partial);
    }

    @ApiProperty()
    id: number;

    @ApiProperty()
    title: string;

    @ApiProperty()
    description: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    userId: number;

    @Exclude()
    user?: UserEntity;
}