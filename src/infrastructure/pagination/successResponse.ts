import { FindManyOptions } from 'typeorm';

export interface ISuccess {
  statusCode: number;
  message: {
    uz: string;
    en: string;
    ru: string;
  };
  data: object;
}

export interface IResponsePagination extends ISuccess {
  totalElements: number;
  totalPages: number;
  pageSize: number;
  currentPage: number;
  from: number;
  to: number;
}

export interface IFindOptions<T> {
  relations?: never[];
  select?: any;
  where?: any;
  order?: any;
  page?: number;
  limit?: number;
}
