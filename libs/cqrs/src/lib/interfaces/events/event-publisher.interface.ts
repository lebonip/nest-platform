
export interface IEventPublisher<EventBase   = any> {
  publish<T extends EventBase = EventBase>(event: T): any;
  publishAll?<T extends EventBase = EventBase>(events: T[]): any;
}
