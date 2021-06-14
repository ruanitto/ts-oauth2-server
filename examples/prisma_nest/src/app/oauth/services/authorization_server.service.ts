import type { CookieOptions, Response } from "express";

import {
  AuthorizationServer as JmondiAuthorizationServer,
  AuthorizationServerOptions,
  DateInterval,
  OAuthException,
} from "../../../../../../src";

import { ENV } from "../../../config/environments";
import { MyJwtService } from "../../../lib/jwt/jwt.service";
import { AuthCodeRepository } from "../repositories/auth_code.repository";
import { ClientRepository } from "../repositories/client.repository";
import { TokenRepository } from "../repositories/token.repository";
import { ScopeRepository } from "../repositories/scope.repository";
import { UserRepository } from "../repositories/user.repository";

type CustomCookieOptions = { cookieTTL?: DateInterval } & CookieOptions;

export class AuthorizationServer extends JmondiAuthorizationServer {
  handleError(e: any, res: Response) {
    if (e instanceof OAuthException) {
      res.status(e.status);
      res.send({
        status: e.status,
        message: e.message,
      });
      return;
    }
    throw e;
  }

  get domain(): string {
    return ENV.urls.web.hostname;
  }

  cookieOptions({ cookieTTL, ...extraParams }: CustomCookieOptions = {}): CookieOptions {
    return {
      domain: this.domain,
      httpOnly: true,
      sameSite: "strict",
      ...(cookieTTL ? { expires: cookieTTL?.getEndDate() } : {}),
      ...extraParams,
    };
  }

  static register(options?: AuthorizationServerOptions) {
    return {
      provide: AuthorizationServer,
      useFactory: (
        authCodeRepo: AuthCodeRepository,
        clientRepo: ClientRepository,
        tokenRepo: TokenRepository,
        scopeRepo: ScopeRepository,
        userRepo: UserRepository,
        jwt: MyJwtService,
      ) => new AuthorizationServer(authCodeRepo, clientRepo, tokenRepo, scopeRepo, userRepo, jwt, options),
      inject: [AuthCodeRepository, ClientRepository, TokenRepository, ScopeRepository, UserRepository, MyJwtService],
    };
  }
}
