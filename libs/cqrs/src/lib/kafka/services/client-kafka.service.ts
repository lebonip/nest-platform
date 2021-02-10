import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { Inject, Logger } from '@nestjs/common';
import { KafkaHeaders, KafkaOptions, MessageHandlerInterface } from '../interfaces';
import {
  BrokersFunction,
  Consumer,
  EachMessagePayload,
  Kafka,
  Producer,
  ProducerRecord,
  RecordMetadata,
} from 'kafkajs';
import { KafkaParser } from '../utils';
import { AbstractClientKafkaService } from './abstract-client-kafka.service';
import { KafkaSerializer } from './kafka-serializer.service';
import { KafkaDeserializer } from './kafka-deserializer.service';
import { EventEmitter } from 'events';

export class ClientKafkaService  extends AbstractClientKafkaService{
  protected readonly logger = new Logger(ClientKafkaService.name);
  protected responseEmitter: EventEmitter;
  protected client: Kafka = null;
  protected consumer: Consumer = null;
  protected producer: Producer = null;
  protected brokers: string[] | BrokersFunction;
  protected clientId: string;
  protected groupId: string;
  protected topics: string[] = [];
  protected replyTopic: string = null;

  constructor(
    @Inject('KAFKA_OPTIONS') protected readonly options: KafkaOptions,
    @Inject('KAFKA_MESSAGE_HANDLER')
    protected messageHandler: MessageHandlerInterface,
    protected serializer: KafkaSerializer,
    protected deserializer: KafkaDeserializer
  ) {
    super();
    this.responseEmitter = new EventEmitter();
    this.setOptions(options);
  }

  public createClient(): Kafka {
    return new Kafka({ ...this.options });
  }

  public async start(callback: () => void = () => {}): Promise<void> {
    this.client = this.createClient();
    const consumerOptions = Object.assign(this.options.consumer || {}, {
      groupId: this.groupId,
    });
    this.consumer = this.client.consumer(consumerOptions);
    this.producer = this.client.producer(this.options.producer);

    await this.consumer.connect();
    await this.producer.connect();
    this.consumer.on(this.consumer.events.GROUP_JOIN, (e) => {
      this.memberAssignment = e.payload.memberAssignment;
    })
    await this.bindEvents(this.consumer);
    callback();
  }

  public async bindEvents(consumer: Consumer) {
    for (const topic of this.topics) {
      await consumer.subscribe({
        topic: topic,
        fromBeginning: true
      });
    }

    await consumer.run({
      eachMessage: this.getMessageHandler(),
    });
  }

  public getMessageHandler() {
    return async (payload: EachMessagePayload) => this.handleMessage(payload);
  }

  public async handleMessage(payload: EachMessagePayload) {
    const rawMessage = KafkaParser.parse(payload);
    const topic = payload.topic;
    const headers = (rawMessage.headers as unknown) as Record<string, any>;
    const correlationId = headers[KafkaHeaders.CORRELATION_ID];
    const replyTopic = headers[KafkaHeaders.REPLY_TOPIC];
    const isReply = headers[KafkaHeaders.IS_REPLY] === '1';
    const replyPartition = headers[KafkaHeaders.REPLY_PARTITION];
    if (isReply && correlationId){
      this.responseEmitter.emit(correlationId, rawMessage.value)
    }else {
      if (replyTopic && replyPartition && correlationId){
        this.messageHandler.onRequest(rawMessage.value, this.getReplier(replyTopic, replyPartition, correlationId))
      }else {
        this.messageHandler.onDispatch(rawMessage.value)
      }
    }

  }

  public async dispatch(
    message: any,
  ): Promise<any> {
    const outgoingMessage = this.serializer.serialize(message);
    const dispatchRecord: ProducerRecord = {
      topic: this.replyTopic,
      messages: [outgoingMessage],
    };
    return this.producer.send(dispatchRecord);
  }

  public async request(
    message: any,
  ): Promise<any> {
    return new Promise(async (resolve, reject) => {

      const correlationId = randomStringGenerator();
      const outgoingMessage = this.serializer.serialize(message);
      this.assignReplyPartition(String(this.getRandomPartitionByTopic(this.replyTopic)), outgoingMessage);
      this.assignReplyTopic(this.replyTopic, outgoingMessage);
      this.assignCorrelationIdHeader(correlationId, outgoingMessage);
      this.assignIsDisposedHeader(true, outgoingMessage);

      const requestRecord: ProducerRecord = {
        topic: this.replyTopic,
        messages: [outgoingMessage],
      };
      const listener = (value) => {
        clearTimeout(timer);
        this.responseEmitter.removeListener(correlationId, listener);
        resolve(value)
      }
      const timer = setTimeout( () => {
        this.responseEmitter.removeListener(correlationId, listener);
        reject({ completed: false });
      }, 10000);

      this.responseEmitter.once(correlationId, listener);
      await this.producer.send(requestRecord);
    });

  }

  public async reply(
    message: any,
    replyTopic: string,
    replyPartition: string,
    correlationId: string,
  ): Promise<RecordMetadata[]> {
    const outgoingMessage = this.serializer.serialize(message);
    this.assignCorrelationIdHeader(correlationId, outgoingMessage);
    this.assignIsReply(true, outgoingMessage);
    this.assignPartition(replyPartition, outgoingMessage)
    const requestRecord: ProducerRecord = {
      topic: replyTopic,
      messages: [outgoingMessage],
    };
    return this.producer.send(requestRecord);
  }


  public getReplier(
    replyTopic: string,
    replyPartition: string,
    correlationId: string,
  ): (data: any) => Promise<RecordMetadata[]> {
    return (data: any) => this.reply(data, replyTopic, replyPartition, correlationId);
  }





  public close(): void {
    this.consumer && this.consumer.disconnect();
    this.producer && this.producer.disconnect();
    this.consumer = null;
    this.producer = null;
    this.client = null;
  }

  private setOptions(options: KafkaOptions) {
    this.brokers = options.brokers || ['localhost:9092'];
    this.clientId = options.clientId;
    this.groupId = options.groupId;
    this.topics.push(this.options.topic);
    this.replyTopic = this.options.topic;
  }
}
