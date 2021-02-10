import { QueryModelType } from './query.interface';

export interface IQueryBus{
  execute<T extends QueryModelType>(query: T): Promise<T["_resultType"]>;
}
