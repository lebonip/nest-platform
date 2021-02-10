import { CommandModelType } from './command.interface';

export interface ICommandBus {
  execute<T extends CommandModelType>(command: T): Promise<T["_resultType"]>;
}
