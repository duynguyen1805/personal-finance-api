import { Affiliate } from '../../../modules/affiliate/entities/affiliate.entity';
import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { affRootSeed } from './affRootSeed';

export default class CreateAffRootSeed implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    try {
      console.log('CreateAffRootSeed is running');
      await connection
        .createQueryBuilder()
        .insert()
        .into(Affiliate)
        .values(affRootSeed)
        .execute();

      await connection
        .createQueryBuilder()
        .insert()
        .into('affiliate_closure')
        .values([{ ancestor_id: 1, descendant_id: 1 }])
        .execute();
    } catch (e) {
      throw e;
    }
  }
}
