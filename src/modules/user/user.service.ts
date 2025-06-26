import { HttpException, HttpStatus } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Connection, Like, Repository, TreeRepository } from 'typeorm';
import { RoleService } from '../role/role.service';
import { FetchUserDto } from './dto/fetch-user.dto';
import { hashMessage } from '@ethersproject/hash';
import { BigNumber, utils } from 'ethers';
import moment from 'moment';
import { LoginAuthDto } from '../auth/dto/login-auth.dto';
import { EnumRole } from '../../enums/role.enum';
import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { decodeUTF8 } from 'tweetnacl-util';

export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(User)
    private treeUserRepository: TreeRepository<User>,
    @InjectConnection() private readonly connection: Connection,
    private roleService: RoleService
  ) {}

  async signIn(userDto: LoginAuthDto, isAdminLogin = false) {
    const { walletAddress, deadline, sig } = userDto;

    if (!isAdminLogin) {
      const verifySig = `Welcome to Solorium!\nClick to sign in and accept the Solorium Terms of Service.\nYour authentication status will reset after 24 hours.\nWallet address: ${walletAddress}`;
      const isSigValid = nacl.sign.detached.verify(
        decodeUTF8(verifySig),
        Uint8Array.from(bs58.decode(sig)),
        new PublicKey(walletAddress).toBytes()
      );

      if (!isSigValid) {
        throw new HttpException('Signature invalid', HttpStatus.BAD_REQUEST);
      }

      const now = moment().unix();
      if (BigNumber.from(deadline).lt(BigNumber.from(now))) {
        throw new HttpException('Deadline invalid', HttpStatus.BAD_REQUEST);
      }
    }

    // check if the user exists in the db
    const userInDb = await this.userRepository.findOne({
      where: [{ walletAddress }, { walletAddress: walletAddress.toLowerCase() }]
    });
    const foundRole = await this.roleService.findOneByName(EnumRole.USER);
    if (!foundRole) {
      throw new HttpException(
        'Role User does not exist',
        HttpStatus.BAD_REQUEST
      );
    }
    if (userInDb) {
      return userInDb;
    }
    if (!userInDb) {
      const user = await this.userRepository.create({
        walletAddress,
        roles: [foundRole]
      });
      const newUser = await this.userRepository.save(user);
      return newUser;
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
