import { configService } from "../../config/config.service";

export const jwtConstants = {
  secret: configService.getEnv('JWT_SECRET')
};
