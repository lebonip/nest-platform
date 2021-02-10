import { isObject } from '@nestjs/common/utils/shared.utils';

export const isBaseEvent = (kafkaValue: any) => {
  if (isObject(kafkaValue)){
    if(kafkaValue['type']){
      return true;
    }
  }
  return false;
}