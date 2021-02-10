import { EventModelType } from './event.interface';

export interface IEventBus {
   publish<T extends EventModelType>(event: T): void;
}
