import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    const { name, permissions, description } = createRoleDto;

    // check role exist
    const foundRole = await this.roleRepository.findOne({ name });

    if (foundRole) {
      throw new HttpException(
        `Role name already exists.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const role = await this.roleRepository.create({
      name,
      permissions: JSON.stringify(permissions),
      description,
    });
    const data = await this.roleRepository.save(role);

    return data;
  }

  findAll() {
    return this.roleRepository.find();
  }

  findOne(id: number) {
    return this.roleRepository.findOne(id);
  }

  findOneByName(name: string) {
    return this.roleRepository.findOne({ name });
  }

  findByIds(ids: number[]) {
    return this.roleRepository.findByIds(ids);
  }

  update(id: number, updateRoleDto: UpdateRoleDto) {
    return `This action updates a #${id} role`;
  }

  remove(id: number) {
    return this.roleRepository.softDelete(id);
  }
}
