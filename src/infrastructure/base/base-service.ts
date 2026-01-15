import { HttpException, NotFoundException } from '@nestjs/common';
import { ILike, Repository } from 'typeorm';
import { successRes } from '../response/success.response';
import {
  IFindOptions,
  IResponsePagination,
  ISuccess,
} from '../pagination/successResponse';
import { RepositoryPager } from '../pagination/RepositoryPager';
import { SoftDeleteDto } from 'src/api/teacher/dto/soft-delete.dto';

export class BaseService<CreateDto, UpdateDto, Entity> {
  constructor(private readonly repository: Repository<any>) {}

  get getRepository() {
    return this.repository;
  }

  async create(dto: CreateDto): Promise<ISuccess> {
    let data = this.repository.create({
      ...dto,
    }) as any as Entity;
    data = await this.repository.save(data);
    return successRes(data, 201);
  }

  async findAll(options?: IFindOptions<Entity>): Promise<ISuccess> {
    const data = (await this.repository.find({
      ...options,
    })) as Entity[];
    return successRes(data);
  }

  async softDelete(
    id: string,
    dto: SoftDeleteDto,
    adminId: string,
  ): Promise<ISuccess> {
    const user = await this.repository.findOne({ where: { id } });
    if (!user) {
      throw new HttpException('User not found', 404);
    }
    user.isDelete = true;
    user.reasonDelete = dto.reason;
    user.deletedBy = adminId;

    const updateData = this.repository.update(id, user);
    return successRes({ updateData });
  }

  async findAllWithPagination(
    options: IFindOptions<Entity> & { search?: string },
  ) {
    const { search, ...otherOptions } = options;

    if (search) {
      otherOptions.where = [
        { username: ILike(`%${search}%`) },
        { phoneNumber: ILike(`%${search}%`) },
      ];
    }

    return await RepositoryPager.findAll(this.getRepository, otherOptions);
  }
  async findOneBy(options: IFindOptions<Entity>): Promise<ISuccess> {
    const data = (await this.repository.findOne({
      select: options.select || {},
      relations: options.relations || [],
      where: options.where,
    })) as Entity;
    if (!data) {
      throw new NotFoundException();
    }
    return successRes(data);
  }

  async findOneById(
    id: string,
    options?: IFindOptions<Entity>,
  ): Promise<ISuccess> {
    const data = (await this.repository.findOne({
      select: options?.select || {},
      relations: options?.relations || [],
      where: { id, ...options?.where },
    })) as unknown as Entity;
    if (!data) {
      throw new NotFoundException();
    }
    return successRes(data);
  }

  async update(id: string, dto: UpdateDto): Promise<ISuccess> {
    await this.findOneById(id);
    await this.repository.update(id, dto as any);
    const data = await this.repository.findOne({ where: { id } });
    return successRes(data);
  }

  async delete(id: string): Promise<ISuccess> {
    await this.findOneById(id);
    (await this.repository.delete(id)) as unknown as Entity;
    return successRes({});
  }

  async restoreTeacher(id: string): Promise<ISuccess> {
    const user = await this.repository.findOne({ where: { id } });
    if (!user) {
      throw new HttpException('User not found', 404);
    }
    user.isDelete = false;

    const updateData = this.repository.update(id, user);
    return successRes({ updateData });
  }
  async updateStatus(id: string): Promise<ISuccess> {
    const user = await this.repository.findOne({
      where: { id },
      select: ['id', 'isActive'],
    });

    if (!user) {
      throw new HttpException('User not found', 404);
    }

    const newStatus = !user.isActive;

    await this.repository.update(id, { isActive: newStatus });

    return successRes({
      message: 'Status updated successfully',
      isActive: newStatus,
    });
  }
}
