import { Injectable } from '@nestjs/common';
import { Restaurant } from './entities/restaurant.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { User } from 'src/users/entities/user.entity';
import { Category } from './entities/category.entity';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async getOrCreateCategory(name: string): Promise<Category> {
    const categoryName = name.trim().toLowerCase();
    const categorySlug = categoryName.replace(/ /g, '-');

    let category = await this.categoryRepository.findOne({
      slug: categorySlug,
    });

    if (!category) {
      category = await this.categoryRepository.save(
        this.categoryRepository.create({
          slug: categorySlug,
          name: categoryName,
        }),
      );
    }

    return category;
  }

  async createRestaurant(
    owner: User,
    createResturantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant =
        this.restaurantRepository.create(createResturantInput);

      newRestaurant.owner = owner;

      const category = await this.getOrCreateCategory(
        createResturantInput.categoryName,
      );

      newRestaurant.category = category;

      await this.restaurantRepository.save(newRestaurant);

      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not create Restaurant',
      };
    }
  }

  async editRestaurant(
    owner: User,
    editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    try {
      const restaurant = await this.restaurantRepository.findOne(
        editRestaurantInput.restaurantId,
        {
          loadRelationIds: true,
        },
      );

      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }

      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: "You can't edit a restaurant that you don't own",
        };
      }

      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not edit Restaurant',
      };
    }
  }
}
