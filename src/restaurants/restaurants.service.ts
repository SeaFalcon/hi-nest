import { Injectable } from '@nestjs/common';
import { Restaurant } from './entities/restaurant.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
  ) {}

  getAll(): Promise<Restaurant[]> {
    return this.restaurantRepository.find();
  }

  createRestaurant(
    createResturantInput: CreateRestaurantDto,
  ): Promise<Restaurant> {
    const newRestaurant =
      this.restaurantRepository.create(createResturantInput);
    return this.restaurantRepository.save(newRestaurant);
  }
}
