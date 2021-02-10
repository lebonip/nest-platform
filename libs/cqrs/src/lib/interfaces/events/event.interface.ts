
export class BaseEventModel{
  static type;
  readonly type: string;

  constructor(...args: any) {}
}

export function EventModel(event: string): new (... args: any) => BaseEventModel {
  return class BaseEvent extends BaseEventModel{
    static type = event;
    readonly type: string = event;

    constructor(...args: any) {
      super()
    }
  };

}
export type EventModelType = BaseEventModel;
export type EventModelClassType = new (... args: any) => BaseEventModel;