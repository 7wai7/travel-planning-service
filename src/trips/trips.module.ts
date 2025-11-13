import { Module } from '@nestjs/common';
import { TripsService } from './trips.service';
import { TripsController } from './trips.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [PrismaModule, JwtModule, UserModule, MailModule],
  controllers: [TripsController],
  providers: [TripsService],
})
export class TripsModule {}
