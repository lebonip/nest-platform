import { Type } from '@nestjs/common';
import { EventModelClassType, EventModelType } from './event.interface';

export interface IEventHandler<TEvent extends EventModelType> {
  _model: new (... args: any) => TEvent;
  handle(query: TEvent): any;
  setModel(model: new (... args: any) => TEvent): void;
  getModel(): new (... args: any) => TEvent;
}

export abstract class BaseEventHandler<TEvent extends EventModelType> implements IEventHandler<TEvent>{
  _model: new (... args: any) => TEvent;
  abstract handle(command: TEvent): any;

  setModel(model: new (... args: any) => TEvent){
    this._model = model;
  }
  getModel(): new (... args: any) => TEvent{
    return this._model;
  }
}

export type IEventHandlerType = IEventHandler<EventModelType>
export type EventHandlerType = Type<IEventHandler<EventModelType>>;
export type EventHandlerTypeAndModel = {
  type: EventHandlerType,
  model: EventModelClassType
}