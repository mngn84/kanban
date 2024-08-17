import { ApiProperty } from "@nestjs/swagger";
import { BoardEntity } from "src/boards/entities/board.entity";
import { Exclude } from 'class-transformer';

export class ColumnEntity {
    constructor(partial: Partial<ColumnEntity>) {
        Object.assign(this, partial);
    }

    @ApiProperty()
    id: number;

    @ApiProperty()
    title: string;

    @ApiProperty()
    position: number;

    @ApiProperty()
    boardId: number;

    @Exclude()
    board?: BoardEntity;
    
    @Exclude()
    userId: number;
}



