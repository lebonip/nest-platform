import { ConsumerConfig, KafkaConfig, ProducerConfig } from 'kafkajs';


export interface KafkaOptions extends KafkaConfig{
    topic: string,
    clientId: string,
    groupId: string,
    consumer?: ConsumerConfig,
    producer?: ProducerConfig
}

