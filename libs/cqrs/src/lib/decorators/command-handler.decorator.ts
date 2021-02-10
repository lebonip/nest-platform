import 'reflect-metadata';
import { CommandModelClassType } from '../index';
import { COMMAND_HANDLER_METADATA } from './constants';

export const CommandHandler = (command: CommandModelClassType): ClassDecorator => {
  return (target) => {
    Reflect.defineMetadata(COMMAND_HANDLER_METADATA, command, target);
  };
};
