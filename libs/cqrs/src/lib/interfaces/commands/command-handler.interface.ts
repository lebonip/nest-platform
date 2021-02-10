import { Type } from '@nestjs/common';
import { CommandModelClassType, CommandModelType } from './command.interface';


export interface ICommandHandler<TCommand extends CommandModelType> {
  _model: new (... args: any) => TCommand;
  handle(command: TCommand): Promise<TCommand["_resultType"]>;
  setModel(model: new (... args: any) => TCommand): void;
  getModel(): new (... args: any) => TCommand;
}
export abstract class BaseCommandHandler<TCommand extends CommandModelType> implements ICommandHandler<TCommand>{
  _model: new (... args: any) => TCommand;
  abstract handle(command: TCommand): Promise<TCommand["_resultType"]>;

  setModel(model: new (... args: any) => TCommand){
    this._model = model;
  }
  getModel(): new (... args: any) => TCommand{
    return this._model;
  }
}
export type ICommandHandlerType  = ICommandHandler<CommandModelType>
export type CommandHandlerType  = Type<ICommandHandler<CommandModelType>>;

export type CommandHandlerTypeAndModel = {
  type: CommandHandlerType,
  model: CommandModelClassType
}