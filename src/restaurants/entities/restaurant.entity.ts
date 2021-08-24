import { Field, ObjectType, InputType } from '@nestjs/graphql';
import { Length, IsString } from 'class-validator';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { CoreEntity } from '../../common/entities/core.entity';
import { Category } from './category.entity';

@InputType('RestaurantInputType', { isAbstract: true })
@ObjectType()
@Entity({ name: 'restaurant', synchronize: true })
export class Restaurant extends CoreEntity {
  @Field(() => String)
  @Column()
  @IsString()
  @Length(5)
  name: string;

  @Field(() => String, { nullable: true })
  @Column({ default: 'Gangnam' })
  @IsString()
  address: string;

  @Field(() => String)
  @Column()
  @IsString()
  coverImg: string;

  @Field(() => Category, { nullable: true })
  @ManyToOne(() => Category, (category) => category.restaurants, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  category: Category;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.restaurants, { onDelete: 'CASCADE' })
  owner: User;

  @RelationId((restaurant: Restaurant) => restaurant.owner)
  ownerId: number;
  newRestaurant: Promise<Category>;
}
