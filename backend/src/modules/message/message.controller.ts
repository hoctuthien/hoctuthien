import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { MessageService } from './services/message.service';
import { CreateMessageInput, UpdateMessageInput } from './types/message.types';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  create(@Body() payload: CreateMessageInput) {
    return this.messageService.create(payload);
  }

  @Get()
  findAll(@Query('conversation_id') conversationId?: string) {
    if (conversationId) {
      return this.messageService.findByConversation(conversationId);
    }
    return this.messageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.messageService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() payload: UpdateMessageInput) {
    return this.messageService.update(id, payload);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.messageService.remove(id);
  }
}
