import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_GUARD } from '@nestjs/core';

import { User } from './Entities/users';
import { Conditions } from './Entities/conditions';
import { Categories } from './Entities/categories';
import { Task, taskView } from './Entities/tasks';
import { Threats } from './Entities/threats';

import { miscService } from './Providers/misc.provider';
import { taskViewService } from './Providers/task.provider';
import { UserService } from './Providers/user.provider';
import { MiscController } from './Controllers/misc/misc.controller';
import { TaskController } from './Controllers/task/task.controller';
import { UserController } from './Controllers/user/user.controller';
import { DatabaseModule } from './database.module';
import { cachingService } from './Providers/caching.provider';
import { task_logs } from './Entities/tasks_trigger';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal:true}),
    DatabaseModule,
    TypeOrmModule.forFeature([
      User,
      Conditions,
      Categories,
      Task,
      taskView,
      Threats,
      task_logs
    ]),
    ThrottlerModule.forRoot({
      throttlers: [
        { name: 'short', ttl: 1000, limit: 3},
        { name: 'medium', ttl: 10000, limit: 20 },
        { name: 'long', ttl: 60000, limit: 100 }
      ],
    }),
    CacheModule.register({
      ttl: 5000, // Cache expiration time in milliseconds
      max: 15, // Maximum number of items in cache
    }),
  ],
  controllers: [
    AppController,
    MiscController,
    TaskController,
    UserController,
  ],
  providers: [
    AppService, 
    miscService,
    taskViewService,
    UserService,
    cachingService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {
}
