
export interface ICommandPublisher<CommandBase  = any> {
  publish<T extends CommandBase = CommandBase>(command: T): any;
}
