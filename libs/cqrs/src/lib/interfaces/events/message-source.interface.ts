import { Subject } from 'rxjs';
import { EventModelType } from './event.interface';

export interface IMessageSource<EventBase extends EventModelType = EventModelType> {
  bridgeEventsTo<T extends EventBase>(subject: Subject<T>): any;
}
