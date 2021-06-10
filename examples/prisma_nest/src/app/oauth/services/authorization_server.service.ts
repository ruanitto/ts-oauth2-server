import type { CookieOptions, Response } from "express";
import { AuthCodeRepo } from "~/app/oauth/repositories/auth_code.repository";
import { ClientRepo } from "~/app/oauth/repositories/client.repository";
import { OAuthUserRepo } from "~/app/oauth/repositories/oauth_user.repository";
import { ScopeRepo } from "~/app/oauth/repositories/scope.repository";
import { TokenRepo } from "~/app/oauth/repositories/token.repository";

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
    let domain = ENV.domain!;
    if (domain.includes(":")) domain = domain.split(":")[0];
    return domain;
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
        authCodeRepo: AuthCodeRepo,
        clientRepo: ClientRepo,
        tokenRepo: TokenRepo,
        scopeRepo: ScopeRepo,
        userRepo: OAuthUserRepo,
        jwt: MyJwtService,
      ) => new AuthorizationServer(authCodeRepo, clientRepo, tokenRepo, scopeRepo, userRepo, jwt, options),
      inject: [AuthCodeRepo, ClientRepo, TokenRepo, ScopeRepo, OAuthUserRepo, MyJwtService],
    };
  }
}
