import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import 'reflect-metadata';
import { CommandHandlerNotFoundException, InvalidCommandHandlerException } from '../exceptions';
import {
  BaseCommandModel,
  CommandHandlerTypeAndModel,
  CommandModelClassType,
  ICommandBus,
  ICommandHandler,
  ICommandHandlerType,
} from '../interfaces/index';
import { MessagePublisher } from '../adapters/message-publisher';

@Injectable()
export class CommandBus implements ICommandBus {
  private handlers = new Map<string, ICommandHandlerType>();
  private models = new Map<string, CommandModelClassType>();

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly messagePublisher: MessagePublisher,
  ) {
  }



  async execute<T extends BaseCommandModel<any>>(command: T): Promise<T["_resultType"]> {
    return this.messagePublisher.request<T["_resultType"]>(command);
  }

  async localExecute<T extends BaseCommandModel<any>>(command: T): Promise<T["_resultType"]>{
    const handler = this.handlers.get(command.type);
    if (handler) {
      const result = await handler.handle(command);
      return result;
    } else {
      throw new CommandHandlerNotFoundException(command.type);
    }
  }

  private bind(
    handler: ICommandHandlerType,
    name: string
  ) {
    this.handlers.set(name, handler);
  }

  findHandler(
    commandName: string,
  ): ICommandHandler<BaseCommandModel<any>> | undefined {
    return this.handlers.get(commandName);
  }


  getHandlers(){
    return this.handlers;
  }

  register(handlersAndModels: CommandHandlerTypeAndModel[] = []) {
    handlersAndModels.forEach((handlerAndModel) =>
      this.registerHandlerAndModel(handlerAndModel),
    );
  }

  protected registerHandlerAndModel(
    handlerAndModel: CommandHandlerTypeAndModel,
  ) {
    const instance = this.moduleRef.get(handlerAndModel.type, {
      strict: false,
    });
    if (!instance) {
      return;
    }
    const target = handlerAndModel.model;
    if (!target) {
      throw new InvalidCommandHandlerException();
    }
    instance.setModel(target);
    this.bind(instance as ICommandHandlerType, target['type']);
  }
}
