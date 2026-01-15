import { FindManyOptions, ObjectLiteral, Repository } from 'typeorm';
import { IResponsePagination } from './successResponse';
import { Pager } from './Pager';

export interface IFindOptions<T> {
  relations?: string[];
  select?: any;
  where?: any;
  order?: any;
  page?: number; 
  limit?: number; 
  take?: number;
  skip?: number; 
}

export class RepositoryPager {
  public static readonly DEFAULT_PAGE = 1;
  public static readonly DEFAULT_PAGE_SIZE = 10;

  public static async findAll<T extends ObjectLiteral>(
    repository: Repository<T>,
    options?: IFindOptions<T>,
  ): Promise<IResponsePagination> {
    const normalizedOptions = RepositoryPager.normalizePagination(options);

    const [data, count] = await repository.findAndCount(normalizedOptions);

    return Pager.of(
      200,
      {
        uz: 'Amaliyot muvaffaqiyatli bajarildi',
        en: 'Operation successfully completed',
        ru: 'Операция успешно выполнена',
      },
      data,
      count,
      normalizedOptions.take || this.DEFAULT_PAGE_SIZE,
      options?.page || this.DEFAULT_PAGE, 
    );
  }

  private static normalizePagination<T>(
    options?: IFindOptions<T>,
  ): FindManyOptions<T> {
    const page =
      options?.page && options.page > 0
        ? options.page
        : RepositoryPager.DEFAULT_PAGE;
    const limit =
      options?.limit && options.limit > 0
        ? options.limit
        : RepositoryPager.DEFAULT_PAGE_SIZE;

    const skip = (page - 1) * limit;

    return {
      ...options,
      take: limit,
      skip: skip,
    } as FindManyOptions<T>;
  }
}
