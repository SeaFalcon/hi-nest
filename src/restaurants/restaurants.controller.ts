import { Controller, Get } from '@nestjs/common';
import { RestaurantService } from './restaurants.service';
import { Restaurant } from './entities/restaurant.entity';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantService: RestaurantService) {}

  // @Get()
  // getAll(): Promise<Restaurant[]> {
  // return this.restaurantService.getAll();
  // }
}
