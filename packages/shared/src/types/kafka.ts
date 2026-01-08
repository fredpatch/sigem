export interface KafkaMessage<T> {
  topic: string;
  key?: string;
  value: T;
}
