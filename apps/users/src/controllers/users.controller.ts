import {
  Controller,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UsersService } from '../services';
import { User } from '../entities';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

//TODO: Need guards for routes that require authentication
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create')
  async createUser(
    @Body('username') username: string,
    @Body('password') password: string,
    @Body('email') email: string,
  ): Promise<User> {
    return this.usersService.createUser(username, password, email);
  }

  @Put('profile/:id')
  async updateUserProfile(
    @Param('id') id: number,
    @Body('firstName') firstName: string,
    @Body('lastName') lastName: string,
  ): Promise<User> {
    return this.usersService.updateUserProfile(id, firstName, lastName);
  }

  @Put('address/:id')
  async updateUserAddress(
    @Param('id') id: number,
    @Body('address') address: string,
  ): Promise<User> {
    return this.usersService.updateUserAddress(id, address);
  }

  @Post(':userId/wishlist/:productId')
  async addToWishlist(
    @Param('userId') userId: number,
    @Param('productId') productId: number,
  ): Promise<User> {
    return this.usersService.addToWishlist(userId, productId);
  }

  @Delete(':userId/wishlist/:productId')
  async removeFromWishlist(
    @Param('userId') userId: number,
    @Param('productId') productId: number,
  ): Promise<User> {
    return this.usersService.removeFromWishlist(userId, productId);
  }

  @Post(':userId/profile-picture')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/profile-pictures',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(
            null,
            `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`,
          );
        },
      }),
    }),
  )
  async uploadProfilePicture(
    @Param('userId') userId: number,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<User> {
    return this.usersService.uploadProfilePicture(userId, file);
  }

  @Delete(':userId/profile-picture')
  async deleteProfilePicture(@Param('userId') userId: number): Promise<User> {
    return this.usersService.deleteProfilePicture(userId);
  }
}
