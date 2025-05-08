import { Test, TestingModule } from '@nestjs/testing';
import { KeycloakController } from '@gitroom/backend/api/routes/keycloak.controller';
import { KeycloakAuthService } from '@gitroom/backend/services/auth/auth.service.keycloak';
import { Provider } from '@prisma/client';
import { ProvidersInterface } from '@gitroom/backend/services/auth/providers.interface';
import { UsersService } from '@gitroom/nestjs-libraries/database/prisma/users/users.service';
import { OrganizationService } from '@gitroom/nestjs-libraries/database/prisma/organizations/organization.service';
import { NotificationService } from '@gitroom/nestjs-libraries/database/prisma/notifications/notification.service';
import { EmailService } from '@gitroom/nestjs-libraries/services/email.service';

// Mock the KeycloakAuthService
class MockKeycloakAuthService {
  async oauthLink(provider: Provider): Promise<string> {
    return 'http://keycloak:8080/auth';
  }

  async checkExists(provider: Provider, code: string): Promise<any> {
    return {
      jwt: 'test-jwt-token',
      token: null
    };
  }

  getProviderInstance(provider: Provider): ProvidersInterface {
    return {
      generateLink: () => 'http://keycloak:8080/auth',
      getToken: async () => 'test-token',
      getUser: async () => ({ email: 'test@example.com', id: 'test-id' })
    } as ProvidersInterface;
  }

  getOrgFromCookie(orgCookie: string) {
    return false;
  }

  async createKeycloakUser(userInfo: any, ip: string, userAgent: string, addToOrg?: any) {
    return {
      jwt: 'test-jwt-token',
      addedOrg: false
    };
  }
}

describe('KeycloakController', () => {
  let controller: KeycloakController;
  let service: KeycloakAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KeycloakController],
      providers: [
        {
          provide: KeycloakAuthService,
          useClass: MockKeycloakAuthService
        },
        {
          provide: UsersService,
          useValue: {}
        },
        {
          provide: OrganizationService,
          useValue: {}
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

    controller = module.get<KeycloakController>(KeycloakController);
    service = module.get<KeycloakAuthService>(KeycloakAuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should redirect to Keycloak login page', async () => {
      const response = {
        redirect: jest.fn()
      };

      await controller.login(response as any);

      expect(response.redirect).toHaveBeenCalledWith('http://keycloak:8080/auth');
    });
  });

  describe('callback', () => {
    it('should handle callback for existing user', async () => {
      const response = {
        cookie: jest.fn(),
        header: jest.fn(),
        redirect: jest.fn()
      };

      const request = {
        cookies: {}
      };

      jest.spyOn(service, 'checkExists').mockResolvedValue({
        jwt: 'test-jwt-token',
        token: null
      });

      process.env.FRONTEND_URL = 'http://localhost:4200';
      process.env.NOT_SECURED = 'true';

      await controller.callback('test-code', request as any, response as any, '127.0.0.1', 'test-user-agent');

      expect(response.cookie).toHaveBeenCalled();
      expect(response.header).toHaveBeenCalledWith('reload', 'true');
      expect(response.redirect).toHaveBeenCalledWith('http://localhost:4200');
    });

    it('should handle callback for new user', async () => {
      const response = {
        cookie: jest.fn(),
        header: jest.fn(),
        redirect: jest.fn()
      };

      const request = {
        cookies: {}
      };

      jest.spyOn(service, 'checkExists').mockResolvedValue({
        jwt: null,
        token: 'test-token'
      });

      jest.spyOn(service, 'createKeycloakUser').mockResolvedValue({
        jwt: 'test-jwt-token',
        addedOrg: false
      });

      process.env.FRONTEND_URL = 'http://localhost:4200';
      process.env.NOT_SECURED = 'true';

      await controller.callback('test-code', request as any, response as any, '127.0.0.1', 'test-user-agent');

      expect(response.cookie).toHaveBeenCalled();
      expect(response.header).toHaveBeenCalledWith('onboarding', 'true');
      expect(response.redirect).toHaveBeenCalledWith('http://localhost:4200');
    });
  });

  describe('logout', () => {
    it('should clear auth cookie and redirect to Keycloak logout page', async () => {
      const response = {
        clearCookie: jest.fn(),
        redirect: jest.fn()
      };

      process.env.FRONTEND_URL = 'http://localhost:4200';
      process.env.ONESSO_BASE_URL = 'http://keycloak:8080';
      process.env.ONESSO_REALM = 'master';

      await controller.logout(response as any);

      expect(response.clearCookie).toHaveBeenCalled();
      expect(response.redirect).toHaveBeenCalled();
    });
  });
});
