import { CoreOutput } from 'src/common/dtos/output.dto';
import { PickType, PartialType, ObjectType, InputType } from '@nestjs/graphql';
import { User } from '../entities/user.entity';

@ObjectType()
export class EditProfileOutput extends CoreOutput {}

@InputType()
export class EditProfileInput extends PartialType(
  PickType(User, ['email', 'password']),
) {}
