import { Module } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ThrottlerModule } from "@nestjs/throttler"
import { CacheModule } from "@nestjs/cache-manager"
import { redisStore } from "cache-manager-redis-store"

import { AuthModule } from "./auth/auth.module"
import { UsersModule } from "./users/users.module"
import { CommentsModule } from "./comments/comments.module"
import { NotificationsModule } from "./notifications/notifications.module"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        url: configService.get("DATABASE_URL"),
        autoLoadEntities: true,
        synchronize: false, // Use migrations in production
        logging: process.env.NODE_ENV === "development",
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
      }),
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore as any,
        url: configService.get("REDIS_URL"),
        ttl: 300, // 5 minutes default TTL
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    AuthModule,
    UsersModule,
    CommentsModule,
    NotificationsModule,
  ],
})
export class AppModule {}
