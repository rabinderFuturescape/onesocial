import { Test, TestingModule } from '@nestjs/testing';
import { KeycloakAuthService } from '@gitroom/backend/services/auth/auth.service.keycloak';
import { UsersService } from '@gitroom/nestjs-libraries/database/prisma/users/users.service';
import { OrganizationService } from '@gitroom/nestjs-libraries/database/prisma/organizations/organization.service';
import { NotificationService } from '@gitroom/nestjs-libraries/database/prisma/notifications/notification.service';
import { EmailService } from '@gitroom/nestjs-libraries/services/email.service';
import { Provider } from '@prisma/client';
import { ProvidersInterface } from '@gitroom/backend/services/auth/providers.interface';
import { ProvidersFactory } from '@gitroom/backend/services/auth/providers/providers.factory';
import * as NewsletterService from '@gitroom/nestjs-libraries/services/newsletter.service';

// Mock the ProvidersFactory
jest.mock('@gitroom/backend/services/auth/providers/providers.factory', () => ({
  ProvidersFactory: {
    loadProvider: jest.fn().mockReturnValue({
      generateLink: jest.fn().mockReturnValue('http://keycloak:8080/auth'),
      getToken: jest.fn().mockResolvedValue('test-token'),
      getUser: jest.fn().mockResolvedValue({ email: 'test@example.com', id: 'test-id' })
    })
  }
}));

// Mock the NewsletterService
jest.mock('@gitroom/nestjs-libraries/services/newsletter.service', () => ({
  NewsletterService: {
    register: jest.fn().mockResolvedValue(true)
  }
}));

// Mock the AuthChecker
jest.mock('@gitroom/helpers/auth/auth.service', () => ({
  AuthService: {
    signJWT: jest.fn().mockResolvedValue('test-jwt-token')
  }
}));

describe('KeycloakAuthService', () => {
  let service: KeycloakAuthService;
  let usersService: UsersService;
  let organizationService: OrganizationService;
  let notificationService: NotificationService;
  let emailService: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KeycloakAuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
            update: jest.fn()
          }
        },
        {
          provide: OrganizationService,
          useValue: {
            createOrgAndUser: jest.fn(),
            addUserToOrg: jest.fn()
          }
        },
        {
          provide: NotificationService,
          useValue: {}
        },
        {
          provide: EmailService,
          useValue: {}
        }
      ]
    }).compile();

    service = module.get<KeycloakAuthService>(KeycloakAuthService);
    usersService = module.get<UsersService>(UsersService);
    organizationService = module.get<OrganizationService>(OrganizationService);
    notificationService = module.get<NotificationService>(NotificationService);
    emailService = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProviderInstance', () => {
    it('should return a provider instance', () => {
      const provider = service.getProviderInstance(Provider.GENERIC);
      
      expect(provider).toBeDefined();
      expect(ProvidersFactory.loadProvider).toHaveBeenCalledWith(Provider.GENERIC);
    });
  });

  describe('createKeycloakUser', () => {
    it('should create a new user and return a JWT token', async () => {
      const userInfo = { email: 'test@example.com', id: 'test-id' };
      const ip = '127.0.0.1';
      const userAgent = 'test-user-agent';

      (organizationService.createOrgAndUser as jest.Mock).mockResolvedValue({
        users: [
          {
            user: {
              id: 'test-user-id',
              email: 'test@example.com'
            }
          }
        ]
      });

      const result = await service.createKeycloakUser(userInfo, ip, userAgent);

      expect(result).toEqual({
        jwt: 'test-jwt-token',
        addedOrg: false
      });

      expect(organizationService.createOrgAndUser).toHaveBeenCalledWith(
        {
          company: '',
          email: 'test@example.com',
          password: '',
          provider: Provider.GENERIC,
          providerId: 'test-id'
        },
        ip,
        userAgent
      );

      expect(NewsletterService.NewsletterService.register).toHaveBeenCalledWith('test@example.com');
    });

    it('should add the user to an organization if specified', async () => {
      const userInfo = { email: 'test@example.com', id: 'test-id' };
      const ip = '127.0.0.1';
      const userAgent = 'test-user-agent';
      const addToOrg = { orgId: 'test-org-id', role: 'USER' as const, id: 'test-invite-id' };

      (organizationService.createOrgAndUser as jest.Mock).mockResolvedValue({
        users: [
          {
            user: {
              id: 'test-user-id',
              email: 'test@example.com'
            }
          }
        ]
      });

      (organizationService.addUserToOrg as jest.Mock).mockResolvedValue({
        organizationId: 'test-org-id'
      });

      const result = await service.createKeycloakUser(userInfo, ip, userAgent, addToOrg);

      expect(result).toEqual({
        jwt: 'test-jwt-token',
        addedOrg: {
          organizationId: 'test-org-id'
        }
      });

      expect(organizationService.addUserToOrg).toHaveBeenCalledWith(
        'test-user-id',
        'test-invite-id',
        'test-org-id',
        'USER'
      );
    });
  });

  describe('getOrgFromCookie', () => {
    it('should return false if no cookie is provided', () => {
      const result = service.getOrgFromCookie('');
      expect(result).toBe(false);
    });

    it('should return the parsed cookie if valid JSON', () => {
      const cookie = JSON.stringify({ orgId: 'test-org-id', role: 'USER', id: 'test-invite-id' });
      const result = service.getOrgFromCookie(cookie);
      expect(result).toEqual({ orgId: 'test-org-id', role: 'USER', id: 'test-invite-id' });
    });

    it('should return false if invalid JSON', () => {
      const result = service.getOrgFromCookie('invalid-json');
      expect(result).toBe(false);
    });
  });
});
