import { HttpException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async create(data: Prisma.UserCreateInput) {
    const existedUser = await this.prismaService.user.findFirst({
      where: {
        OR: [
          {
            email: {
              contains: data.email,
              mode: 'insensitive', // for case-insensitive search
            },
          },
          {
            username: {
              contains: data.username,
              mode: 'insensitive',
            },
          },
        ],
      },
    });

    console.log(existedUser);

    if (existedUser)
      throw new HttpException({ message: 'This user already exists' }, 400);

    return await this.prismaService.user.create({
      data,
    });
  }
}

// npx neonctl@latest init