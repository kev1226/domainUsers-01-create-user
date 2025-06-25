import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '54.160.106.5',
      port: 5432,
      username: 'postgres',
      password: 'root',
      database: 'users_db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    UsersModule,
  ],

  controllers: [],
  providers: [],
})
export class AppModule {}
