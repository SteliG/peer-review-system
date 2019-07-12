import { AuthGuard } from '@nestjs/passport';
import { ShowUserDTO } from './models/show-user.dto';
import { 
    Controller,
    Param, 
    UseGuards,
    Get, 
} from '@nestjs/common';
import { UsersService } from './users.service';
import { WorkItemService } from '../workItem/work-item.service';
import { ShowWorkItemDTO } from '../workItem/models/show-work-item.dto';

@UseGuards(AuthGuard())
@Controller('api/users')
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly workItemService: WorkItemService,
  ) {}

    @Get()
    async findAll(): Promise<ShowUserDTO[]> {
        return this.userService.findAllUsers();
    }

    @Get(':userId')
    async findSingleUser(
      @Param('userId') userId: string,
    ): Promise<ShowUserDTO> {
      return this.userService.findSingleUser(userId);
    }

    @Get('/work-item/:userId')
    async findUserWorkItems(
      @Param('userId') userId: string,
    ): Promise<undefined> {
      
      console.log(userId);
      const result: Promise<ShowWorkItemDTO[]> = this.workItemService.getWorkItemsByUserId(userId);

      console.log(await result);
      

      return Promise.resolve(undefined);
    }
}
