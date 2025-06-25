import { KafkaOptions, Transport } from '@nestjs/microservices';

export const kafkaServerConfig: KafkaOptions = {
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: 'create-user',
      brokers: ['3.232.44.31:9092'], // IP pública de tu instancia EC2
    },
    consumer: {
      groupId: 'create-user-group-server',
    },
  },
};
