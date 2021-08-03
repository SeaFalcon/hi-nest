import { Field, ObjectType, InputType } from '@nestjs/graphql';
import { Length, IsBoolean, IsString, IsOptional } from 'class-validator';
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
  @IsString()
  @Length(5, 10)
  name: string;

  @Field(() => Boolean, { defaultValue: true })
  @Column({ default: true })
  @IsOptional()
  @IsBoolean()
  isVegan: boolean;

  @Field(() => String, { nullable: true })
  @Column({ default: 'Gangnam' })
  address: string;

  @Field(() => String)
  @Column()
  ownerName: string;

  @Field(() => String)
  @Column()
  categoryName: string;
}
