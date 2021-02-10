import { CommandHandlerTypeAndModel } from './commands/command-handler.interface';
import { EventHandlerTypeAndModel } from './events/event-handler.interface';
import { QueryHandlerTypeAndModel } from './queries/query-handler.interface';

export interface CqrsHandlers {
  events?:EventHandlerTypeAndModel[];
  queries?:QueryHandlerTypeAndModel[];
  commands?:CommandHandlerTypeAndModel[];

}



