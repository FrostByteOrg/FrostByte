import { Message } from '@/types/dbtypes';

export class StoredChannel {
  public id: number;
  public name: string;
  public serverId: number;
  public messages: Map<number, Message>;

  constructor(
    id: number,
    name: string,
    serverId: number
  ) {
    this.id = id;
    this.name = name;
    this.serverId = serverId;
    this.messages = new Map<number, Message>();
  }
}
