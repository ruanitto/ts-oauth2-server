import { HttpStatus, Injectable } from "@nestjs/common";
import type { FastifyReply } from "fastify";

import { ClientRepository } from "~/app/oauth/repositories/client.repository";
import { AuthorizationServer } from "~/app/oauth/services/authorization_server.service";
import { User } from "~/entities/user.entity";
import { MyJwtService } from "~/lib/jwt/jwt.service";
import { ENV } from "~/config/environments";
import { ScopeRepository } from "~/app/oauth/repositories/scope.repository";
import { UserRepository } from "~/lib/database/repositories/user.repository";

@Injectable()
export class LoginService {
  constructor(
    private readonly clientRepo: ClientRepository,
    private readonly scopeRepo: ScopeRepository,
    private readonly userRepository: UserRepository,
    private readonly oauth: AuthorizationServer,
    private readonly jwt: MyJwtService,
  ) {}

  async loginAndRedirect(user: User, ipAddr: string, res: FastifyReply, query: string) {
    await this.userRepository.incrementLastLogin(user, ipAddr);

    const jwt = await this.jwt.sign({
      userId: user.id,
      email: user.email,
    });

    const cookieTTL = new DateInterval(ENV.oauth.authorizationServer.loginDuration);
    const options = this.oauth.cookieOptions({ cookieTTL });

    res.cookie(COOKIES.token, jwt, options);
    res.status(HttpStatus.FOUND);
    res.redirect(API_ROUTES.authorize.template + "?" + query);
  }
}
