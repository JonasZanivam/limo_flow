import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { Public } from '../common/decorators/auth.decorators';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import {
  clearAuthCookies,
  getRefreshTokenFromRequest,
  setAuthCookies,
} from './auth-cookies';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 900_000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.login(dto.email, dto.password, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    setAuthCookies(res, tokens, this.configService);

    return {
      expiresIn: tokens.expiresIn,
      user: tokens.user,
    };
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken =
      getRefreshTokenFromRequest(req.cookies) ?? dto.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Sessão inválida ou expirada');
    }

    const tokens = await this.authService.refresh(refreshToken, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    setAuthCookies(res, tokens, this.configService);

    return {
      expiresIn: tokens.expiresIn,
      user: tokens.user,
    };
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getUserProfile(user.id);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const refreshToken =
      getRefreshTokenFromRequest(req.cookies) ?? dto.refreshToken;

    if (refreshToken) {
      await this.authService.logout(refreshToken, user.id);
    }

    clearAuthCookies(res);
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logoutAll(
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logoutAll(user.id);
    clearAuthCookies(res);
  }
}
