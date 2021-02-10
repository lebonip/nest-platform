import { DynamicModule, Module, OnApplicationBootstrap } from '@nestjs/common';
import { CqrsKafkaOptions } from './options';
import { CommandBus, EventBus, QueryBus } from './bus';
import { ExplorerService } from './services/explorer.service';
import { MessageHandler } from './adapters/message-handler';
import { ClientKafkaService, KafkaDeserializer, KafkaSerializer } from './kafka';
import { MessagePublisher } from './adapters/message-publisher';

const Services = [
  ClientKafkaService,
  ExplorerService,
  EventBus,
  CommandBus,
  QueryBus,
  MessageHandler,
  MessagePublisher,
  KafkaSerializer,
  KafkaDeserializer
];

@Module({
  imports: [],
  //providers: [],
  exports: [],
})
export class CqrsKafkaModule implements OnApplicationBootstrap {
  constructor(
    private readonly clientKafka: ClientKafkaService,
    private readonly explorerService: ExplorerService,
    private readonly eventsBus: EventBus,
    private readonly commandsBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {
  }

  async onApplicationBootstrap() {
    const { events, queries, commands } = this.explorerService.explore();
    this.eventsBus.register(events);
    this.commandsBus.register(commands);
    this.queryBus.register(queries);
    // @TODO Await
    await this.clientKafka.start();
  }

  public static forRoot(options: CqrsKafkaOptions): DynamicModule {
    return {
      global: true,
      module: CqrsKafkaModule,
      imports: [],
      providers: [
        {
          provide: 'KAFKA_OPTIONS',
          useValue: options.kafka,
        },
        {
          provide: 'KAFKA_MESSAGE_HANDLER',
          useClass: MessageHandler
        },
        ...Services
      ],
      exports: [
        {
          provide: 'KAFKA_OPTIONS',
          useValue: options.kafka,
        },
        CommandBus,
        QueryBus,
        EventBus,
      ],
    };
  }
}
