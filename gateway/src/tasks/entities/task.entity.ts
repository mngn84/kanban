import { ApiProperty } from "@nestjs/swagger";
import { ColumnEntity } from "src/columns/entities/column.entity";
import { Exclude } from 'class-transformer';

export class TaskEntity {
    constructor(partial: Partial<TaskEntity>) {
        Object.assign(this, partial);
    }

    @ApiProperty()
    id: number;

    @ApiProperty()
    title: string;

    @ApiProperty()
    description: string;

    @ApiProperty()
    columnId: number;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    movedAt: Date;

    @Exclude()
    column?: ColumnEntity;

    @Exclude()
    userId: number;
}