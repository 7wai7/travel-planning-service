import { IsNumber, IsOptional, IsString, Min } from "class-validator";

export default class CreatePlaceDto {
    @IsString()
    readonly locationName: string;

    @IsNumber()
    @Min(1)
    readonly dayNumber: number;

    @IsOptional()
    @IsString()
    readonly notes?: string;
}