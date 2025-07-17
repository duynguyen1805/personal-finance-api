import { MigrationInterface, QueryRunner } from 'typeorm';
import { ECategoriesType } from '../../src/modules/categories/enums/categories.enum';

export class insertDataCategories1752715215976 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO categories ("cateroryName", "typeCategory", "categoryColor", "categoryIcon", "userId", "allocatedAmount")
      VALUES 
        ('Food & Drinks', '${ECategoriesType.ESSENTIAL_NEED}', '#f97316', '🍽️', 1, 0),
        ('Transportation (fuel, bus, Grab)', '${ECategoriesType.ESSENTIAL_NEED}', '#10b981', '🛵', 1, 0),
        ('Rent', '${ECategoriesType.ESSENTIAL_NEED}', '#6366f1', '🏠', 1, 0),
        ('Utilities (electricity, water)', '${ECategoriesType.ESSENTIAL_NEED}', '#facc15', '💡', 1, 0),
        ('Internet', '${ECategoriesType.ESSENTIAL_NEED}', '#3b82f6', '🌐', 1, 0),
        ('Healthcare & Medicine', '${ECategoriesType.ESSENTIAL_NEED}', '#ef4444', '💊', 1, 0),
        ('Tuition / Mandatory courses', '${ECategoriesType.ESSENTIAL_NEED}', '#8b5cf6', '📚', 1, 0),
        ('Living fees (trash, phone, etc.)', '${ECategoriesType.ESSENTIAL_NEED}', '#eab308', '🧾', 1, 0),
        ('Entertainment (movies, Netflix, games)', '${ECategoriesType.PERSONAL_WANTS}', '#ec4899', '🎮', 1, 0),
        ('Personal shopping (clothes, cosmetics...)', '${ECategoriesType.PERSONAL_WANTS}', '#d946ef', '🛍️', 1, 0),
        ('Travel / Picnic', '${ECategoriesType.PERSONAL_WANTS}', '#22d3ee', '🌴', 1, 0),
        ('Technology gadgets (headphones, accessories...)', '${ECategoriesType.PERSONAL_WANTS}', '#0ea5e9', '🎧', 1, 0),
        ('Cafe / Hangout with friends', '${ECategoriesType.PERSONAL_WANTS}', '#c084fc', '☕', 1, 0),
        ('Savings', '${ECategoriesType.SAVING_AND_INVESTMENT}', '#16a34a', '💰', 1, 0),
        ('Investment (stocks, crypto...)', '${ECategoriesType.SAVING_AND_INVESTMENT}', '#0f766e', '📈', 1, 0),
        ('Supporting family', '${ECategoriesType.SAVING_AND_INVESTMENT}', '#10b981', '🤝', 1, 0),
        ('Emergency fund', '${ECategoriesType.SAVING_AND_INVESTMENT}', '#f87171', '🧯', 1, 0),
        ('Gifts / Weddings / Birthdays', '${ECategoriesType.FAMILY_AND_GIVING}', '#f59e0b', '🎁', 1, 0),
        ('Charity', '${ECategoriesType.FAMILY_AND_GIVING}', '#ef4444', '❤️', 1, 0),
        ('Others', '${ECategoriesType.OTHER}', '#9ca3af', '📦', 1, 0)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM categories 
      WHERE "userId" = 1 AND "cateroryName" IN (
        'Food & Drinks',
        'Transportation (fuel, bus, Grab)',
        'Rent',
        'Utilities (electricity, water)',
        'Internet',
        'Healthcare & Medicine',
        'Tuition / Mandatory courses',
        'Living fees (trash, phone, etc.)',
        'Entertainment (movies, Netflix, games)',
        'Personal shopping (clothes, cosmetics...)',
        'Travel / Picnic',
        'Technology gadgets (headphones, accessories...)',
        'Cafe / Hangout with friends',
        'Savings',
        'Investment (stocks, crypto...)',
        'Supporting family',
        'Emergency fund',
        'Gifts / Weddings / Birthdays',
        'Charity',
        'Others'
      )
    `);
  }
}
