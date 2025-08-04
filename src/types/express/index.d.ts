// src/types/express/index.d.ts
import { User } from '../../modules/user/entities/user.entity';

// deploy Render require
// mở rộng type (augment type)
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
