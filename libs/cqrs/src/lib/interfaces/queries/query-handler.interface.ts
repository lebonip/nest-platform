import { Type } from '@nestjs/common';
import { QueryModelClassType, QueryModelType } from './query.interface';

export interface IQueryHandler<TQuery extends QueryModelType> {
  _model: new (... args: any) => TQuery;
  handle(query: TQuery): Promise<any>;
  setModel(model: new (... args: any) => TQuery): void;
  getModel(): new (... args: any) => TQuery;
}

export abstract class BaseQueryHandler<TQuery extends QueryModelType> implements IQueryHandler<TQuery>{
  _model: new (... args: any) => TQuery;
  abstract handle(command: TQuery): Promise<TQuery["_resultType"]>;

  setModel(model: new (... args: any) => TQuery){
    this._model = model;
  }
  getModel(): new (... args: any) => TQuery{
    return this._model;
  }
}

export type IQueryHandlerType = IQueryHandler<QueryModelType>;
export type QueryHandlerType = Type<IQueryHandler<QueryModelType>>;

export type QueryHandlerTypeAndModel = {
  type: QueryHandlerType,
  model: QueryModelClassType
}

