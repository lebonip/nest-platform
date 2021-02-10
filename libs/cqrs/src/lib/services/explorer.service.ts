import { Injectable, Type } from '@nestjs/common';
import { ModulesContainer } from '@nestjs/core/injector/modules-container';
import { COMMAND_HANDLER_METADATA, EVENT_HANDLER_METADATA, QUERY_HANDLER_METADATA } from '../decorators/constants';
import {
  CommandHandlerTypeAndModel,
  CqrsHandlers,
  EventHandlerTypeAndModel,
  QueryHandlerTypeAndModel,
} from '../interfaces';

import { flatMap } from 'lodash';

@Injectable()
export class ExplorerService {
  constructor(private readonly modulesContainer: ModulesContainer) {}

  explore(): CqrsHandlers {
    // @TODO check
    const commands = this.findCommandHandler();
    // @TODO check
    const queries = this.findQueryHandler();
    const events = this.findEventHandler();
    return { commands, queries, events };
  }

  getAllProviders(): Record<string, any>[] {
    const modulesMap = [...this.modulesContainer.entries()];
    return flatMap(modulesMap, ([key, nestModule]) => {
      const components = [...nestModule['providers'].values()];
      return components.map((component) => {
        const { instance } = component;
        return instance;
      });
    });
  }
  findCommandHandler(): CommandHandlerTypeAndModel[] {
    const commands = [];
    this.getAllProviders().forEach((instance) => {
      if (instance) {
        if (instance.constructor) {
          const metadata = Reflect.getOwnMetadata(
            COMMAND_HANDLER_METADATA,
            instance.constructor,
          );
          if (metadata) {
            commands.push({
              type: instance.constructor as Type<any>,
              model: metadata,
            });
          }
        }
      }
    });
    return commands;
  }

  findEventHandler(): EventHandlerTypeAndModel[] {
    const events = [];
    this.getAllProviders().forEach((instance) => {
      if (instance) {
        if (instance.constructor) {
          const metadata = Reflect.getOwnMetadata(
            EVENT_HANDLER_METADATA,
            instance.constructor,
          );
          if (metadata) {
            events.push({
              type: instance.constructor as Type<any>,
              model: metadata,
            });
          }
        }
      }
    });
    return events;
  }

  findQueryHandler(): QueryHandlerTypeAndModel[] {
    const queries = [];
    this.getAllProviders().forEach((instance) => {
      if (instance) {
        if (instance.constructor) {
          const metadata = Reflect.getOwnMetadata(
            QUERY_HANDLER_METADATA,
            instance.constructor,
          );
          if (metadata) {
            queries.push({
              type: instance.constructor as Type<any>,
              model: metadata,
            });
          }
        }
      }
    });
    return queries;
  }
}
