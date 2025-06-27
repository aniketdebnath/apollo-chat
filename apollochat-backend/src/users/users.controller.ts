// users.controller.ts
// REST controller for user profile management (e.g., image upload)
import {
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TokenPayload } from '../auth/interfaces/token-payload.interface';
import { UsersService } from './users.service';

/**
 * UsersController
 *
 * Handles RESTful operations for user profile management, including image upload with validation.
 */
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Uploads a profile picture for the authenticated user
   *
   * @param file - The uploaded image file (JPEG format only)
   * @param user - Current authenticated user from JWT token
   * @returns Result of the upload operation
   * @throws {BadRequestException} If file validation fails (size or type)
   */
  @Post('image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfilePicture(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5000000 }),
          new FileTypeValidator({ fileType: /(image\/jpeg|image\/png)/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.usersService.uploadImage(file.buffer, user._id);
  }
}
