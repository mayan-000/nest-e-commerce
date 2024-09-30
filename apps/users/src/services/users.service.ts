import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Product, User } from '../entities';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly productRepository: Repository<Product>,
  ) {}

  async createUser(
    username: string,
    password: string,
    email: string,
  ): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userExists = await this.userRepository.findOne({ where: { email } });

    if (userExists) {
      throw new Error('User already exists');
    }

    const user = this.userRepository.create({
      username,
      password: hashedPassword,
      email,
    });

    // Add email verification logic here

    return this.userRepository.save(user);
  }

  async findUserByUsername(username: string): Promise<User | undefined> {
    return this.userRepository.findOneBy({ username });
  }

  async findUserByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOneBy({ email });
  }

  async updateUserProfile(
    id: number,
    firstName: string,
    lastName: string,
  ): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (user) {
      user.firstName = firstName;
      user.lastName = lastName;
      return this.userRepository.save(user);
    }
    throw new Error('User not found');
  }

  async updateUserAddress(id: number, address: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (user) {
      user.address = address;
      return this.userRepository.save(user);
    }
    throw new Error('User not found');
  }

  async addToWishlist(userId: number, productId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['wishlist'],
    });
    const product = await this.productRepository.findOneBy({ id: productId });

    if (!user || !product) {
      throw new Error('User or Product not found');
    }

    user.wishlist.push(product);
    return this.userRepository.save(user);
  }

  async removeFromWishlist(userId: number, productId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['wishlist'],
    });

    if (!user) {
      throw new Error('User not found');
    }

    user.wishlist = user.wishlist.filter((product) => product.id !== productId);
    return this.userRepository.save(user);
  }

  async uploadProfilePicture(
    userId: number,
    file: Express.Multer.File,
  ): Promise<User> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new Error('User not found');
    }

    const filePath = `uploads/profile-pictures/${file.filename}`;
    user.profilePicture = filePath;
    return this.userRepository.save(user);
  }

  async deleteProfilePicture(userId: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new Error('User not found');
    }

    if (user.profilePicture) {
      fs.unlinkSync(path.resolve(user.profilePicture));
      user.profilePicture = null;
      return this.userRepository.save(user);
    }

    throw new Error('Profile picture not found');
  }
}
