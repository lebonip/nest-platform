import { Injectable } from '@nestjs/common';
import { CommandBus, EventBus, QueryBus } from '../bus';
import { MessageHandlerInterface } from '../kafka';
import { RecordMetadata } from 'kafkajs';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { isBaseEvent } from '../utils/kafka-event.utils';
import {
  CommandModelType,
  EventModelType,
  IBaseEvent,
  ICommandHandler,
  IEventHandler,
  IQueryHandler,
  QueryModelType,
} from '../interfaces';

@Injectable()
export class MessageHandler implements MessageHandlerInterface {
  constructor(
    public readonly commandBus: CommandBus,
    protected readonly queryBus: QueryBus,
    protected readonly eventBus: EventBus,
  ) {}

  async onRequest(value: any, replier: (data) => Promise<RecordMetadata[]>) {
    if (isBaseEvent(value)) {
      const handlerObj = this.findHandler(value);
      if (handlerObj && (handlerObj.handlerType === "query")) {
        const model = handlerObj.handler.getModel();
        const event = plainToClass(model, value);
        const errors = await validate(event);
        if (errors.length > 0) {
        } else {
          const result = await handlerObj.handler.handle(event);
          replier(result);
        }
      }
      if (handlerObj && (handlerObj.handlerType === "command")) {
        const model = handlerObj.handler.getModel();
        const event = plainToClass(model, value);
        const errors = await validate(event);
        if (errors.length > 0) {
        } else {
          const result = await handlerObj.handler.handle(event);
          replier(result);
        }
      }
    }
  }

  async onDispatch(value: any) {
    if (isBaseEvent(value)) {
      const handlerObj = this.findHandler(value);
      if (handlerObj && (handlerObj.handlerType === "event")) {
        const model = handlerObj.handler.getModel();
        const event = plainToClass(model, value);
        const errors = await validate(event);
        if (errors.length > 0) {
        } else {
          handlerObj.handler.handle(event);
        }
      }
      if (handlerObj && (handlerObj.handlerType === "command")) {
        const model = handlerObj.handler.getModel();
        const event = plainToClass(model, value);
        const errors = await validate(event);
        if (errors.length > 0) {
        } else {
          handlerObj.handler.handle(event);
        }
      }
    }
  }


  findHandler(event: IBaseEvent):
    | { handler: ICommandHandler<CommandModelType>; handlerType: 'command' }
    | { handler: IQueryHandler<QueryModelType>; handlerType: 'query' }
    | { handler: IEventHandler<EventModelType>; handlerType: 'event' } {
    const commandHandler = this.commandBus.findHandler(event.type);
    if (commandHandler) {
      return {handler: commandHandler, handlerType: 'command'};
    }
    const queryHandler = this.queryBus.findHandler(event.type);
    if (queryHandler) {
      return {handler: queryHandler, handlerType: 'query'};
    }
    const eventHandler = this.eventBus.findHandler(event.type);
    if (eventHandler) {
      return {handler: eventHandler, handlerType: 'event'};
    }
    return null;
  }
}
