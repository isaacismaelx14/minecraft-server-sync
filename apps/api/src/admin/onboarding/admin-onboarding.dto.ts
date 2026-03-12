import {
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CompleteOnboardingDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  displayName!: string;

  @IsString()
  @IsOptional()
  serverAddress?: string;

  @IsString()
  @MinLength(1)
  minecraftVersion!: string;

  @IsString()
  @MinLength(1)
  loaderVersion!: string;

  @IsUrl()
  @IsOptional()
  brandingLogoUrl?: string;

  @IsUrl()
  @IsOptional()
  brandingBackgroundUrl?: string;
}
