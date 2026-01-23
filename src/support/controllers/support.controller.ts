import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('support')
@Controller('support')
export class SupportController {
  // General support endpoints can go here
}
