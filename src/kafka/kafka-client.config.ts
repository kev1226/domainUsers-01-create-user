import { ClientsModuleOptions, Transport } from '@nestjs/microservices';

// This file configures the Kafka client for the User Search Service
// It sets the client ID and broker address for connecting to the Kafka cluster
export const kafkaClientConfig: ClientsModuleOptions = [
  {
    name: 'USER_SEARCH_SERVICE',
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'create-user',
        brokers: ['3.232.44.31:9092'],
      },
      consumer: {
        groupId: 'create-user-group',
      },
    },
  },
];
