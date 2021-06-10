import { MiddlewareConsumer, Module } from "@nestjs/common";
import csurf from "csurf";

import { LoginController } from "~/app/oauth/controllers/login.controller";
import { TokenController } from "~/app/oauth/controllers/token.controller";
import { DatabaseModule } from "~/lib/database/database.module";
import { AuthorizationServer } from "~/app/oauth/services/authorization_server.service";
import { LoggerModule } from "~/lib/logger/logger.module";
import { repositories, strategies } from "~/app/oauth/oauth.providers";
import { AuthorizeController } from "~/app/oauth/controllers/authorize.controller";
import { LogoutController } from "~/app/oauth/controllers/logout.controller";
import { ScopesController } from "~/app/oauth/controllers/scopes.controller";
import { LoginService } from "~/app/oauth/services/login.service";

@Module({
  controllers: [
    AuthorizeController,
    LoginController,
    LogoutController,
    ScopesController,
    TokenController,
  ],
  imports: [DatabaseModule, LoggerModule, JwtModule],
  providers: [...strategies, ...repositories, LoginService, AuthorizationServer.register()],
})
export class OAuthModule {
  constructor(private readonly oauth: AuthorizationServer) {
    this.oauth.enableGrantType("client_credentials");
    this.oauth.enableGrantType("authorization_code");
    this.oauth.enableGrantType("refresh_token");
    this.oauth.enableGrantType("password");
  }

  configure(consumer: MiddlewareConsumer) {
    const middlewares = [csurf({ cookie: { httpOnly: true } })];
    consumer.apply(...middlewares).forRoutes(LoginController, ScopesController);
  }
}
