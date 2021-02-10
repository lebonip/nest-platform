export class BaseQueryModel<R>{
  _resultType: R;
  static type;
  readonly type: string;

  constructor(...args: any) {}
}

export function QueryModel<R>(event: string): new (... args: any) => BaseQueryModel<R> {
  return class BaseQuery extends BaseQueryModel<R>{
    static type = event;
    readonly type: string = event;

    constructor(...args: any) {
      super()
    }
  };

}
export type QueryModelType = BaseQueryModel<any>;
export type QueryModelClassType = new (... args: any) => BaseQueryModel<any>;

