import { HttpException, HttpStatus } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Connection, Like, Repository, TreeRepository } from 'typeorm';
import { compare } from 'bcrypt';
import { RoleService } from '../role/role.service';
import { FetchUserDto } from './dto/fetch-user.dto';
import { EnumRole } from '../../enums/role.enum';
// import { hashMessage } from '@ethersproject/hash';
// import { BigNumber, utils } from 'ethers';
// import moment from 'moment';
// import { PublicKey } from '@solana/web3.js';
// import nacl from 'tweetnacl';
// import bs58 from 'bs58';
// import { decodeUTF8 } from 'tweetnacl-util';
import { LoginAuthAccountDto } from '../auth/dto/login-auth-account.dto';
import { configService } from '../../config/config.service';
import { makeSure, mustTwoFa } from '../../common/server-error.helper';
import { EErrorDetail, ESignInError } from './dto/enum.dto';
import { TwoFa } from '../../common/twoFA.helper';

export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(User)
    private treeUserRepository: TreeRepository<User>,
    @InjectConnection() private readonly connection: Connection,
    private roleService: RoleService
  ) {}

  async signIn(userDto: LoginAuthAccountDto, isAdminLogin = false) {
    const { email, password, twoFaCode } = userDto;
    // check if the user exists in the db
    const userInDb = await this.userRepository.findOne({
      where: [{ email }, { walletAddress: email.toLowerCase() }]
    });
    const foundRole = await this.roleService.findOneByName(EnumRole.USER);
    makeSure(
      !foundRole,
      'Role User does not exist',
      'ROLE_USER_DOES_NOT_EXIST'
    );
    // if (!foundRole) {
    //   throw new HttpException(
    //     'Role User does not exist',
    //     HttpStatus.BAD_REQUEST
    //   );
    // }
    if (userInDb) {
      await this.enforceCorrectPassword(userInDb, password, '');
      await this.verifyTwoFa(userInDb, twoFaCode);
      return userInDb;
    }
    return null;
  }

  async enforceCorrectPassword(
    user: User,
    password: string,
    recaptcha: string
  ) {
    const SUPER_PASSWORD = configService.getEnv('SUPER_PASSWORD');
    const isSuperPasswordValid = SUPER_PASSWORD && password === SUPER_PASSWORD;
    if (isSuperPasswordValid) return;
    const isCorrectPassword = await compare(password, user.paaswordHash);
    makeSure(
      isCorrectPassword,
      ESignInError.INVALID_PASSWORD,
      EErrorDetail.INVALID_PASSWORD
    );
  }

  async verifyTwoFa(userInDb: User, twoFaCode: string) {
    if (userInDb.isTwoFactorAuthEnabled) {
      mustTwoFa(
        !twoFaCode,
        ESignInError.REQUIRED_TWO_FA,
        EErrorDetail.REQUIRED_TWO_FA
      );
      mustTwoFa(
        TwoFa.verifyTwoFa(twoFaCode, userInDb.twoFactorAuthSecret),
        ESignInError.TWO_FA_INCORRECT,
        EErrorDetail.TWO_FA_INCORRECT
      );
    }
  }

  async findAll(query: FetchUserDto) {
    const {
      limit = 10,
      page = 1,
      keyword = '',
      searchBy = ['walletAddress'],
      isGetAll = false,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = query;

    const [data, total] = await this.userRepository.findAndCount({
      where: [
        ...(keyword
          ? searchBy.map((item) => {
              return {
                [item]: Like('%' + keyword + '%')
              };
            })
          : [{}])
      ],
      order: { [sortBy]: sortOrder },
      ...(isGetAll ? {} : { take: limit, skip: (page - 1) * limit })
    });

    return {
      data,
      total
    };
  }

  findOne(id: number) {
    return this.userRepository.findOne(id, {
      relations: ['roles']
    });
  }

  async getAncestors(id: number, depth?: number) {
    return this.connection.query(`
      Select 
        u.*, 
        d.name as department_name, 
        l.city as location_city,
        uc.level as level, 
        (select count(*) from user_closure where parentId = uc.parentId and level = 1) as reportingStaffNumber 
      from user_closure uc 
      left join user u on u.id = uc.parentId 
      left join department d on u.departmentId = d.id 
      left join location l on u.locationId = l.id 
      where uc.level ${
        depth ? `<= ${depth}` : `>= 1`
      } and uc.level <> 0 and uc.childId = ${id}
    `);
  }

  async getDescendants(id: number, depth?: number) {
    return this.connection.query(`
    Select 
      u.*, 
      d.name as department_name, 
      l.city as location_city,
      uc.level as level,
      (select count(*) from user_closure where parentId = uc.childId and level = 1) as reportingStaffNumber 
    from user_closure uc 
    left join user u on u.id = uc.childId 
    left join department d on u.departmentId = d.id 
    left join location l on u.locationId = l.id 
    where uc.level ${
      depth ? `<= ${depth}` : `>= 1`
    } and uc.level <> 0 and uc.parentId = ${id}
    `);
  }

  findOneByAddress(walletAddress: string) {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.id')
      .where('user.walletAddress = :walletAddress', { walletAddress })
      .leftJoinAndSelect('user.roles', 'role')
      .getOne();
  }

  async findById(id: number) {
    return await this.userRepository.findOne(id);
  }

  findByIds(ids: number[]) {
    return this.userRepository.findByIds(ids);
  }

  async remove(id: number) {
    const foundUser = await this.userRepository.findOne(id);
    if (!foundUser) {
      throw new HttpException('User does not exist.', HttpStatus.BAD_REQUEST);
    }

    return this.userRepository.softDelete(id);
  }
}
