import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"

import { CommentsService } from "./comments.service"
import { CommentsController } from "./comments.controller"
import { Comment } from "../entities/comment.entity"
import { NotificationsModule } from "../notifications/notifications.module"

@Module({
  imports: [TypeOrmModule.forFeature([Comment]), NotificationsModule],
  providers: [CommentsService],
  controllers: [CommentsController],
  exports: [CommentsService],
})
export class CommentsModule {}
