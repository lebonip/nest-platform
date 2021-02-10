import { RecordMetadata } from 'kafkajs';


export interface MessageHandlerInterface {

  onRequest(value: any, replier: (data) => Promise<RecordMetadata[]>);

  onDispatch(value: any);

}