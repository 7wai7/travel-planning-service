import { IsDate, IsNotEmpty, IsOptional, IsString, Max, Min } from "class-validator";

export default class CreateTripDto {
    @IsString()
    @IsNotEmpty()
    @Min(4)
    @Max(20)
    readonly title: string;

    @IsOptional()
    @IsString()
    @Min(10)
    @Max(1000)
    readonly description?: string;

    @IsOptional()
    @IsDate()
    readonly startDate?: string;

    @IsOptional()
    @IsDate()
    readonly endDate?: string;
}