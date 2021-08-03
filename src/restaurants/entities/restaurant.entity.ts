import { Field, ObjectType, InputType } from '@nestjs/graphql';
import { Length, IsBoolean } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@InputType({ isAbstract: true })
@ObjectType()
@Entity({ name: 'restaurant', synchronize: false })
export class Restaurant {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column()
  @Length(5, 10)
  name: string;

  @Field(() => Boolean)
  @Column()
  @IsBoolean()
  isVegan: boolean;

  @Field(() => String)
  @Column()
  address: string;

  @Field(() => String)
  @Column()
  ownerName: string;

  @Field(() => String)
  @Column()
  categoryName: string;
}
