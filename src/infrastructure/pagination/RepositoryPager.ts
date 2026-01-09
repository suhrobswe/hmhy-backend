import { FindManyOptions, ObjectLiteral, Repository } from 'typeorm';
import { IResponsePagination } from './successResponse';
import { Pager } from './Pager';

export interface IFindOptions<T> {
  relations?: string[]; // never[] o'rniga string[]
  select?: any;
  where?: any;
  order?: any;
  page?: number; // Tashqaridan keladigan sahifa raqami
  limit?: number; // Tashqaridan keladigan elementlar soni
  take?: number; // TypeORM uchun (ixtiyoriy)
  skip?: number; // TypeORM uchun (ixtiyoriy)
}

export class RepositoryPager {
  public static readonly DEFAULT_PAGE = 1;
  public static readonly DEFAULT_PAGE_SIZE = 10;

  public static async findAll<T extends ObjectLiteral>(
    repository: Repository<T>,
    options?: IFindOptions<T>,
  ): Promise<IResponsePagination> {
    // 1. Parametrlarni normallashtiramiz
    const normalizedOptions = RepositoryPager.normalizePagination(options);

    // 2. Baza so'rovi
    const [data, count] = await repository.findAndCount(normalizedOptions);

    // 3. Javobni qaytarish
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
      options?.page || this.DEFAULT_PAGE, // Hozirgi sahifa
    );
  }

  private static normalizePagination<T>(
    options?: IFindOptions<T>,
  ): FindManyOptions<T> {
    // Sahifani aniqlash (minimal 1)
    const page =
      options?.page && options.page > 0
        ? options.page
        : RepositoryPager.DEFAULT_PAGE;
    // Limitni aniqlash (minimal 1)
    const limit =
      options?.limit && options.limit > 0
        ? options.limit
        : RepositoryPager.DEFAULT_PAGE_SIZE;

    // TypeORM OFFSET hisoblash: (page - 1) * limit
    const skip = (page - 1) * limit;

    return {
      ...options,
      take: limit,
      skip: skip,
    } as FindManyOptions<T>;
  }
}
