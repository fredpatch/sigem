// notification-service/common/consumer.ts
// Re-export from shared to maintain backward compatibility
export {
  startConsumer,
  type ConsumerConfig as SharedConsumerConfig,
} from "@sigem/shared/kafka";
