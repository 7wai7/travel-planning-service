import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { TripsModule } from './trips/trips.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [AuthModule, UserModule, PrismaModule, TripsModule, MailModule],
  providers: [PrismaService, UserService]
})
export class AppModule {}
