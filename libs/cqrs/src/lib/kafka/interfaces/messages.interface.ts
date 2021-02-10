export interface OutgoingEventMessage<T = string> {
  message: {
    event: T
  };
}

export interface IncomingEventMessage<T = string> {
  message: {
    event: T
  };
}

export interface OutgoingRequestMessage{
  message: {
    event: any
  };
}


export interface IncomingRequestMessage<T = any>{
  message: {
    event: T
  };
  correlationId: string,
  replyTo: string,
}


export interface IncomingRequestMessage<T = any>{
  message: {
    event: T
  };
  correlationId: string,
  replyTo: string,
}

export interface IncomingResponseMessage<T = any>{
  message: {
    event: T,
    err?: any;
    isDisposed?: boolean;
    status?: string;
  };
  correlationId: string,
}

export interface OutgoingResponseMessage<T = any>{
  message: {
    event: T,
    err?: any;
    isDisposed?: boolean;
    status?: string;
  };
  correlationId: string,
  replyTo: string,
}



