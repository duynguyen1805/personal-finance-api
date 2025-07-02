import { HttpException, HttpStatus } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Connection, Like, Repository, TreeRepository } from 'typeorm';
import { FetchUserDto } from './dto/fetch-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
// import { mustExist } from 'src/common/server-error.helper';
// import { EErrorDetail, EUserServiceError } from './dto/enum.dto';
import { UpdateUserUseCase } from './use-cases/update-user.use-case';
// import { hashMessage } from '@ethersproject/hash';
// import { BigNumber, utils } from 'ethers';
// import moment from 'moment';
// import { PublicKey } from '@solana/web3.js';
// import nacl from 'tweetnacl';
// import bs58 from 'bs58';
// import { decodeUTF8 } from 'tweetnacl-util';

export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(User)
    private treeUserRepository: TreeRepository<User>,
    @InjectConnection() private readonly connection: Connection,
    private readonly updateUserUseCase: UpdateUserUseCase
  ) {}

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

  // async getAncestors(id: number, depth?: number) {
  //   return this.connection.query(`
  //     Select
  //       u.*,
  //       d.name as department_name,
  //       l.city as location_city,
  //       uc.level as level,
  //       (select count(*) from user_closure where parentId = uc.parentId and level = 1) as reportingStaffNumber
  //     from user_closure uc
  //     left join user u on u.id = uc.parentId
  //     left join department d on u.departmentId = d.id
  //     left join location l on u.locationId = l.id
  //     where uc.level ${
  //       depth ? `<= ${depth}` : `>= 1`
  //     } and uc.level <> 0 and uc.childId = ${id}
  //   `);
  // }

  // async getDescendants(id: number, depth?: number) {
  //   return this.connection.query(`
  //   Select
  //     u.*,
  //     d.name as department_name,
  //     l.city as location_city,
  //     uc.level as level,
  //     (select count(*) from user_closure where parentId = uc.childId and level = 1) as reportingStaffNumber
  //   from user_closure uc
  //   left join user u on u.id = uc.childId
  //   left join department d on u.departmentId = d.id
  //   left join location l on u.locationId = l.id
  //   where uc.level ${
  //     depth ? `<= ${depth}` : `>= 1`
  //   } and uc.level <> 0 and uc.parentId = ${id}
  //   `);
  // }

  // findOneByAddress(walletAddress: string) {
  //   return this.userRepository
  //     .createQueryBuilder('user')
  //     .addSelect('user.id')
  //     .where('user.walletAddress = :walletAddress', { walletAddress })
  //     .leftJoinAndSelect('user.roles', 'role')
  //     .getOne();
  // }

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

  async updateUserInfo(userId: number, dto: UpdateUserDto) {
    return this.updateUserUseCase.execute(userId, dto);
  }
}
