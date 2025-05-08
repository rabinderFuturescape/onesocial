import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  Body,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { KeycloakAuthService } from '@gitroom/backend/services/auth/auth.service.keycloak';
import { getCookieUrlFromDomain } from '@gitroom/helpers/subdomain/subdomain.management';
import { Provider } from '@prisma/client';
import { RealIP } from 'nestjs-real-ip';
import { UserAgent } from '@gitroom/nestjs-libraries/user/user.agent';

@ApiTags('Keycloak Auth')
@Controller('/auth/keycloak')
export class KeycloakController {
  constructor(private _authService: KeycloakAuthService) {}

  @Get('/login')
  async login(@Res() response: Response) {
    try {
      // Generate Keycloak login URL
      const loginUrl = await this._authService.oauthLink(Provider.GENERIC);

      // Redirect to Keycloak login page
      return response.redirect(loginUrl);
    } catch (error) {
      return response.status(500).json({ error: error.message });
    }
  }

  @Get('/callback')
  async callback(
    @Query('code') code: string,
    @Req() req: Request,
    @Res() response: Response,
    @RealIP() ip: string,
    @UserAgent() userAgent: string
  ) {
    try {
      // Exchange code for token and get user info
      const { jwt, token } = await this._authService.checkExists(Provider.GENERIC, code);

      if (token) {
        // User doesn't exist, create a new user
        const getOrgFromCookie = this._authService.getOrgFromCookie(
          req?.cookies?.org
        );

        // Get user info from Keycloak
        const providerInstance = this._authService.getProviderInstance(Provider.GENERIC);
        const userInfo = await providerInstance.getUser(token);

        // Create a new user
        const { jwt: newJwt, addedOrg } = await this._authService.createKeycloakUser(
          userInfo,
          ip,
          userAgent,
          getOrgFromCookie
        );

        // Set auth cookie
        response.cookie('auth', newJwt, {
          domain: getCookieUrlFromDomain(process.env.FRONTEND_URL!),
          ...(!process.env.NOT_SECURED
            ? {
                secure: true,
                httpOnly: true,
                sameSite: 'none',
              }
            : {}),
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
        });

        if (process.env.NOT_SECURED) {
          response.header('auth', newJwt);
        }

        if (typeof addedOrg !== 'boolean' && addedOrg?.organizationId) {
          response.cookie('showorg', addedOrg.organizationId, {
            domain: getCookieUrlFromDomain(process.env.FRONTEND_URL!),
            ...(!process.env.NOT_SECURED
              ? {
                  secure: true,
                  httpOnly: true,
                  sameSite: 'none',
                }
              : {}),
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
          });

          if (process.env.NOT_SECURED) {
            response.header('showorg', addedOrg.organizationId);
          }
        }

        response.header('onboarding', 'true');
        return response.redirect(process.env.FRONTEND_URL!);
      } else {
        // User exists, set auth cookie
        response.cookie('auth', jwt, {
          domain: getCookieUrlFromDomain(process.env.FRONTEND_URL!),
          ...(!process.env.NOT_SECURED
            ? {
                secure: true,
                httpOnly: true,
                sameSite: 'none',
              }
            : {}),
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
        });

        if (process.env.NOT_SECURED) {
          response.header('auth', jwt);
        }

        response.header('reload', 'true');
        return response.redirect(process.env.FRONTEND_URL!);
      }
    } catch (error) {
      return response.status(500).json({ error: error.message });
    }
  }

  @Post('/logout')
  async logout(@Res() response: Response) {
    try {
      // Clear auth cookie
      response.clearCookie('auth', {
        domain: getCookieUrlFromDomain(process.env.FRONTEND_URL!),
        ...(!process.env.NOT_SECURED
          ? {
              secure: true,
              httpOnly: true,
              sameSite: 'none',
            }
          : {}),
      });

      // Redirect to Keycloak logout page
      const logoutUrl = `${process.env.ONESSO_BASE_URL}/realms/${process.env.ONESSO_REALM}/protocol/openid-connect/logout?redirect_uri=${encodeURIComponent(process.env.FRONTEND_URL!)}`;
      return response.redirect(logoutUrl);
    } catch (error) {
      return response.status(500).json({ error: error.message });
    }
  }
}
