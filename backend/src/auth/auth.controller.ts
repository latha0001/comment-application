import { Controller, Post, UseGuards, Request } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { Throttle } from "@nestjs/throttler"

import type { AuthService } from "./auth.service"
import type { CreateUserDto } from "../users/dto/create-user.dto"
import type { LoginDto } from "./dto/login.dto"

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  @Post("login")
  async login(loginDto: LoginDto) {
    return this.authService.login(loginDto)
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 registrations per minute
  @Post("register")
  async register(createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto)
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
