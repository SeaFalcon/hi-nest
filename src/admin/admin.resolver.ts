import { Args, Query, Resolver } from '@nestjs/graphql';
import { Admin } from './entities/admin.entity';
import { AdminService } from './admin.service';

@Resolver(() => Admin)
export class AdminResolver {
  constructor(private readonly adminService: AdminService) {}

  @Query(() => [Admin])
  admins(): Promise<Admin[]> {
    return this.adminService.getAll();
  }

  @Query(() => Admin)
  admin(@Args('mba_seq') mbaSeq: number): Promise<Admin> {
    return this.adminService.getOneById(mbaSeq);
  }
}
