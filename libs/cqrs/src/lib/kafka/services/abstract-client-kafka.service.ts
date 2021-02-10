import { IMemberAssignment, Message } from 'kafkajs';
import { KafkaHeaders } from '../interfaces';

export abstract class AbstractClientKafkaService {
  protected memberAssignment: IMemberAssignment = {};

  public assignIsDisposedHeader(
    isDisposed: boolean,
    message: Message,
  ) {
    if (!isDisposed) {
      return;
    }
    message.headers[KafkaHeaders.NEST_IS_DISPOSED] = '';
  }

  public assignErrorHeader(
    error: any,
    message: Message,
  ) {
    if (error) {
      return;
    }
    message.headers[KafkaHeaders.NEST_ERROR] = Buffer.from(
      error
    );
  }

  public assignReplyPartition(
    replyPartition: string,
    message: Message,
  ) {
    message.headers[KafkaHeaders.REPLY_PARTITION] = replyPartition
  }

  public assignPartition(
    partition: string,
    message: Message,
  ) {
    message.partition =  Number(partition);
  }

  public assignIsReply(
    isReply: boolean,
    message: Message,
  ) {
    message.headers[KafkaHeaders.IS_REPLY] = isReply ? '1' : '0'
  }

  public assignReplyTopic(
    replyTopic: string,
    message: Message,
  ) {
    message.headers[KafkaHeaders.REPLY_TOPIC] = replyTopic;
  }

  public assignCorrelationIdHeader(
    correlationId: string,
    message: Message,
  ) {
    message.headers[KafkaHeaders.CORRELATION_ID] = correlationId
  }
  getPartitionsByTopic(topic: string): number[]{
    return  this.memberAssignment[topic]
  }
  getRandomPartitionByTopic(topic: string){
    const array = this.getPartitionsByTopic(topic)
    return array[Math.floor(Math.random() * array.length)];
  }
}
