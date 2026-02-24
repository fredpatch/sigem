// packages/shared/src/kafka/consumer/index.ts
export { startConsumer, type ConsumerConfig } from "./factory";
export { unwrapKafkaEvent, type KafkaEnvelope } from "./unwrap";
