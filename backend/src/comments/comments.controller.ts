import { Controller, Get, Post, Patch, Param, Delete, UseGuards, Request } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { Throttle } from "@nestjs/throttler"

import type { CommentsService } from "./comments.service"
import type { CreateCommentDto } from "./dto/create-comment.dto"
import type { UpdateCommentDto } from "./dto/update-comment.dto"

@Controller("comments")
@UseGuards(AuthGuard("jwt"))
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 comments per minute
  @Post()
  create(createCommentDto: CreateCommentDto, @Request() req) {
    return this.commentsService.create(createCommentDto, req.user.id)
  }

  @Get()
  findAll() {
    return this.commentsService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentsService.findById(id);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 edits per minute
  @Patch(":id")
  update(@Param('id') id: string, updateCommentDto: UpdateCommentDto, @Request() req) {
    return this.commentsService.update(id, updateCommentDto, req.user.id)
  }

  @Delete(":id")
  remove(@Param('id') id: string, @Request() req) {
    return this.commentsService.delete(id, req.user.id)
  }

  @Post(":id/restore")
  restore(@Param('id') id: string, @Request() req) {
    return this.commentsService.restore(id, req.user.id)
  }
}
