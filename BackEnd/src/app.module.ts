import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { User } from './Entities/users';
import { Conditions } from './Entities/conditions';
import { Categories } from './Entities/categories';
import { Task, taskView } from './Entities/tasks';

import { miscService, taskViewService, UserService } from './Providers/psql.provider';
import { MiscController } from './Controllers/misc/misc.controller';
import { TaskController } from './Controllers/task/task.controller';
import { UserController } from './Controllers/user/user.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
        type: 'postgres',
        host: '192.168.1.70',
        port: 5432,
        password: '820824',
        username: 'angelorafael',
        database: 'tododb',
        entities: [
          User,
          Task,
          Conditions,
          Categories,
          taskView
          ],
        //synchronize: true,
        logging: true,
        //autoLoadEntities: true,
    }),
    TypeOrmModule.forFeature([
      User,
      Conditions,
      Categories,
      Task,
      taskView
    ]),
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
  ],
})
export class AppModule {
}
