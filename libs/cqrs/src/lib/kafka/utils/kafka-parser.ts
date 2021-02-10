import { isNil, isString } from '@nestjs/common/utils/shared.utils';
import { EachMessagePayload, IHeaders } from 'kafkajs';
import { dateReviver } from '../../utils';

export class KafkaParser {
  public static parse(payload: EachMessagePayload): KafkaMessageParsed {

    const parsed: KafkaMessageParsed = {} as KafkaMessageParsed;
    parsed.topic = payload.topic;
    parsed.partition = payload.partition;
    parsed.value = this.decode(payload.message.value);
    if (!isNil(payload.message.key)) {
      parsed.key = this.decode(payload.message.key);
    }
    parsed.headers = {};
    if (!isNil(payload.message.headers)) {
      const decodeHeaderByKey = (key: string) => {
        if (isString(payload.message.headers[key])) {
          parsed.headers[key] = payload.message.headers[key] as string;
        } else {
          parsed.headers[key] = this.decode(
            payload.message.headers[key] as Buffer,
          ) as string;
        }
      };
      Object.keys(payload.message.headers).forEach(decodeHeaderByKey);
    }
    return parsed;
  }

  public static decode(value: Buffer): object | string | null {
    if (isNil(value)) {
      return null;
    }
    let result = value.toString();
    const startChar = result.charAt(0);
    // only try to parse objects and arrays
    if (startChar === '{' || startChar === '[') {
      try {
        result = JSON.parse(value.toString(), dateReviver);
      } catch (e) {}
    }
    return result;
  }
}

export interface KafkaMessageParsed {
  topic: string;
  key?: string | null | object;
  value: any;
  partition?: number;
  headers?: IHeaders;
  timestamp?: string;
}
export interface KafkaHeadersParsed {
  [key: string]: string;
}
