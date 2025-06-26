import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { roleSeed } from './roleSeed';
import { Role } from '../../../modules/role/entities/role.entity';

export default class CreateRoleSeed implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    try {
      console.log('CreateRoleSeed is running');
      await connection
        .createQueryBuilder()
        .insert()
        .into(Role)
        .values(roleSeed)
        .execute();
    } catch (e) {
      throw e;
    }
  }
}
