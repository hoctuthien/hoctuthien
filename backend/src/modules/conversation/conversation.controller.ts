import { Controller, Get, Param } from '@nestjs/common';
import { ConversationService } from './services/conversation.service';

@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.conversationService.findOne(id);
  }
}
