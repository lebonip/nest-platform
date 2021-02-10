import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ClientKafkaService } from '../kafka';
import { CommandModelType, EventModelType, QueryModelType } from '../interfaces';


@Injectable()
export class MessagePublisher {

  constructor(
    @Inject(forwardRef(() => ClientKafkaService))
    private readonly client: ClientKafkaService) {}

  publish(
    event: EventModelType | CommandModelType
  ): Promise<any> {
    return this.client.dispatch(event);
  }

  async request<TResult>(event: QueryModelType | CommandModelType): Promise<TResult>{
    const result = await this.client.request(event);
    return result;
  }

 // @TODO
  reply(){

  }

}
