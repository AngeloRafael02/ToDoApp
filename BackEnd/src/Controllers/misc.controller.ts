
import { Controller, Get } from '@nestjs/common';
import { Categories } from 'src/Entities/categories';
import { Conditions } from 'src/Entities/conditions';
import { miscService } from 'src/Providers/psql.provider';

@Controller('misc')
export class CatsController {
    constructor(
        private miscService:miscService
    ){}

  @Get('allCat')
  getCategories(): Promise<Categories[]>{
    return this.miscService.findAllCat();
  }

  @Get('allCond')
  getConsditions():Promise<Conditions[]>{
    return this.miscService.findAllCond();
  }
}
