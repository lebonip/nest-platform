export class QueryHandlerNotFoundException extends Error {
  constructor(queryName: string) {
    super(`The query handler for the "${queryName}" query was not found!`);
  }
}

export class RemoteQueryHandlerNotFoundException extends Error {
  constructor(queryName: string) {
    super(`The remote query handler for the "${queryName}" query was not found!`);
  }
}