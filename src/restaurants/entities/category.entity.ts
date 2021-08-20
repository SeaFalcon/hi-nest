import { Field, ObjectType, InputType } from '@nestjs/graphql';
import { Length, IsString } from 'class-validator';
import { Column, Entity, OneToMany } from 'typeorm';
import { CoreEntity } from '../../common/entities/core.entity';
import { Restaurant } from './restaurant.entity';

@InputType('CategoryInputType', { isAbstract: true })
@ObjectType()
@Entity({ name: 'category', synchronize: true })
export class Category extends CoreEntity {
  @Field(() => String)
  @Column({ unique: true })
  @IsString()
  @Length(5)
  name: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  coverImg: string;

  @Field(() => String)
  @Column({ unique: true })
  @IsString()
  slug: string;

  @Field(() => [Restaurant])
  @OneToMany(() => Restaurant, (restaurant) => restaurant.category)
  restaurants: Restaurant[];
}
