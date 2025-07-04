import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { Cache } from "cache-manager"

import type { Comment } from "../entities/comment.entity"
import type { CreateCommentDto } from "./dto/create-comment.dto"
import type { UpdateCommentDto } from "./dto/update-comment.dto"
import type { NotificationsService } from "../notifications/notifications.service"

@Injectable()
export class CommentsService {
  private commentsRepository: Repository<Comment>
  private notificationsService: NotificationsService
  private cacheManager: Cache

  constructor(
    commentsRepository: Repository<Comment>,
    notificationsService: NotificationsService,
    cacheManager: Cache,
  ) {
    this.commentsRepository = commentsRepository
    this.notificationsService = notificationsService
    this.cacheManager = cacheManager
  }

  async create(createCommentDto: CreateCommentDto, userId: string): Promise<Comment> {
    // Validate parent comment exists if parentId is provided
    if (createCommentDto.parentId) {
      const parentComment = await this.findById(createCommentDto.parentId)
      if (parentComment.isDeleted) {
        throw new BadRequestException("Cannot reply to deleted comment")
      }
    }

    const comment = this.commentsRepository.create({
      content: createCommentDto.content,
      parentId: createCommentDto.parentId,
      userId,
    })

    const savedComment = await this.commentsRepository.save(comment)

    // Create notification for parent comment author
    if (createCommentDto.parentId) {
      const parentComment = await this.commentsRepository.findOne({
        where: { id: createCommentDto.parentId },
        relations: ["user"],
      })

      if (parentComment && parentComment.userId !== userId) {
        await this.notificationsService.create({
          userId: parentComment.userId,
          commentId: savedComment.id,
          type: "reply",
          message: `${savedComment.user?.username || "Someone"} replied to your comment`,
        })
      }
    }

    // Clear cache
    await this.cacheManager.del("comments:all")

    return this.findById(savedComment.id)
  }

  async findAll(): Promise<Comment[]> {
    const cacheKey = "comments:all"
    const cached = await this.cacheManager.get<Comment[]>(cacheKey)

    if (cached) {
      return cached
    }

    const comments = await this.commentsRepository.find({
      where: { isDeleted: false },
      relations: ["user", "replies", "replies.user"],
      order: { createdAt: "DESC" },
    })

    // Build nested structure
    const commentMap = new Map<string, Comment>()
    const rootComments: Comment[] = []

    // First pass: create map of all comments
    comments.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, replies: [] })
    })

    // Second pass: build hierarchy
    comments.forEach((comment) => {
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId)
        if (parent) {
          parent.replies.push(commentMap.get(comment.id)!)
        }
      } else {
        rootComments.push(commentMap.get(comment.id)!)
      }
    })

    await this.cacheManager.set(cacheKey, rootComments, 300) // Cache for 5 minutes
    return rootComments
  }

  async findById(id: string): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: ["user", "parent", "replies", "replies.user"],
    })

    if (!comment) {
      throw new NotFoundException("Comment not found")
    }

    return comment
  }

  async update(id: string, updateCommentDto: UpdateCommentDto, userId: string): Promise<Comment> {
    const comment = await this.findById(id)

    if (comment.userId !== userId) {
      throw new ForbiddenException("You can only edit your own comments")
    }

    if (comment.isDeleted) {
      throw new BadRequestException("Cannot edit deleted comment")
    }

    if (!comment.canEdit) {
      throw new BadRequestException("Comment can only be edited within 15 minutes of posting")
    }

    await this.commentsRepository.update(id, {
      content: updateCommentDto.content,
    })

    // Clear cache
    await this.cacheManager.del("comments:all")

    return this.findById(id)
  }

  async delete(id: string, userId: string): Promise<Comment> {
    const comment = await this.findById(id)

    if (comment.userId !== userId) {
      throw new ForbiddenException("You can only delete your own comments")
    }

    if (comment.isDeleted) {
      throw new BadRequestException("Comment is already deleted")
    }

    await this.commentsRepository.update(id, {
      isDeleted: true,
      deletedAt: new Date(),
    })

    // Clear cache
    await this.cacheManager.del("comments:all")

    return this.findById(id)
  }

  async restore(id: string, userId: string): Promise<Comment> {
    const comment = await this.findById(id)

    if (comment.userId !== userId) {
      throw new ForbiddenException("You can only restore your own comments")
    }

    if (!comment.isDeleted) {
      throw new BadRequestException("Comment is not deleted")
    }

    if (!comment.canRestore) {
      throw new BadRequestException("Comment can only be restored within 15 minutes of deletion")
    }

    await this.commentsRepository.update(id, {
      isDeleted: false,
      deletedAt: null,
    })

    // Clear cache
    await this.cacheManager.del("comments:all")

    return this.findById(id)
  }
}
