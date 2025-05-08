import { Injectable } from '@nestjs/common';
import { Provider, User } from '@prisma/client';
import { AuthService } from '@gitroom/backend/services/auth/auth.service';
import { UsersService } from '@gitroom/nestjs-libraries/database/prisma/users/users.service';
import { OrganizationService } from '@gitroom/nestjs-libraries/database/prisma/organizations/organization.service';
import { AuthService as AuthChecker } from '@gitroom/helpers/auth/auth.service';
import { ProvidersFactory } from '@gitroom/backend/services/auth/providers/providers.factory';
import { ProvidersInterface } from '@gitroom/backend/services/auth/providers.interface';
import { NotificationService } from '@gitroom/nestjs-libraries/database/prisma/notifications/notification.service';
import { EmailService } from '@gitroom/nestjs-libraries/services/email.service';
import { NewsletterService } from '@gitroom/nestjs-libraries/services/newsletter.service';

@Injectable()
export class KeycloakAuthService extends AuthService {
  constructor(
    private readonly _userService: UsersService,
    private readonly _organizationService: OrganizationService,
    private readonly _notificationService: NotificationService,
    private readonly _emailService: EmailService
  ) {
    super(_userService, _organizationService, _notificationService, _emailService);
  }

  // Add a method to get the provider instance
  getProviderInstance(provider: Provider): ProvidersInterface {
    return ProvidersFactory.loadProvider(provider);
  }

  // Add a method to create a user from Keycloak
  async createKeycloakUser(
    userInfo: { email: string; id: string },
    ip: string,
    userAgent: string,
    addToOrg?: boolean | { orgId: string; role: 'USER' | 'ADMIN'; id: string }
  ) {
    // Create a new user with Keycloak as the provider
    const create = await this._organizationService.createOrgAndUser(
      {
        company: '',
        email: userInfo.email,
        password: '',
        provider: Provider.GENERIC,
        providerId: userInfo.id,
      },
      ip,
      userAgent
    );

    // Register the user with the newsletter service
    await NewsletterService.register(userInfo.email);

    // Add the user to the organization if specified
    const addedOrg =
      addToOrg && typeof addToOrg !== 'boolean'
        ? await this._organizationService.addUserToOrg(
            create.users[0].user.id,
            addToOrg.id,
            addToOrg.orgId,
            addToOrg.role
          )
        : false;

    // Generate a JWT token for the user
    const jwt = await this.jwt(create.users[0].user);

    return { jwt, addedOrg };
  }

  // Add a method to get the organization from the cookie
  getOrgFromCookie(orgCookie: string) {
    if (!orgCookie) {
      return false;
    }

    try {
      const org = JSON.parse(orgCookie);
      return org;
    } catch (e) {
      return false;
    }
  }

  // Add a method to generate a JWT token
  async jwt(user: User) {
    return AuthChecker.signJWT(user);
  }
}
