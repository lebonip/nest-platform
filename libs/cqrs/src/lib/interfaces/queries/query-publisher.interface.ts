
export interface IQueryPublisher<QueryBase  = any> {
  publish<T extends QueryBase = QueryBase>(query: T): any;
}
