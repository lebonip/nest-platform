import { Message } from 'kafkajs';
import { isNil, isObject, isString, isUndefined } from '@nestjs/common/utils/shared.utils';


export class KafkaSerializer {

  serialize(value: any): Message {
    const message: Message = {} as Message;
    const isNotKafkaMessage = isNil(value) || !isObject(value) || (!('key' in value) && !('value' in value));
    if (isNotKafkaMessage) {
      message.value = value;
    }
    message.value = this.encode(value);
    if (!isNil(value.key)) {
      message.key = this.encode(value.key);
    }
    if (isNil(value.headers)) {
      message.headers = {};
    }
    return message;
  }

  public encode(value: any): Buffer | string | null {
    const isObjectOrArray =
      !isNil(value) && !isString(value) && !Buffer.isBuffer(value);
    if (isObjectOrArray) {
      return JSON.stringify(value);
    } else if (isUndefined(value)) {
      return null;
    }
    return value;
  }
}
