import {Component, OnInit} from '@angular/core';
import {ChatListComponent} from "../../components/chat-list/chat-list.component";
import {ChatResponse} from "../../services/models/chat-response";
import {ChatService} from "../../services/services/chat.service";
import {KeycloakService} from "../../utils/keycloak/keycloak.service";
import {MessageService} from "../../services/services/message.service";
import {MessageResponse} from "../../services/models/message-response";
import {DatePipe} from "@angular/common";

@Component({
  selector: 'app-main',
  imports: [
    ChatListComponent,
    DatePipe
  ],
  templateUrl: './main.component.html',
  standalone: true,
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit{

  chats: Array<ChatResponse> = [];
  selectedChat: ChatResponse = {};
  chatMessages: MessageResponse[] = [];

  constructor(
    private chatService: ChatService,
    private keycloakService: KeycloakService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.getAllChats();
    /*this.messageService.saveMessage({
      'body': {
        'content': 'Hello back',
        'chatId': 'd4222124-efd6-4b67-8bcc-78c94f110c34',
        'receiverId': 'bb8f51b1-ec94-49c2-8c7e-1034a5c378c1',
        'senderId': 'be42226f-f1ea-43ae-a2a0-c83dffa7931c',
        'type': 'TEXT'
      }
    }).subscribe({
      next:(response ) => {
        console.log('message sent', response);
      }
    });*/
  }

  private getAllChats(){
    this.chatService.getChatsByReceiver()
      .subscribe({
        next: (res: ChatResponse[]) => {
          this.chats = res;
        }
      })
  }

  logout() {
    this.keycloakService.logout;
  }

  userProfile() {
    this.keycloakService.accountManagement();
  }

  chatSelected(chatResponse: ChatResponse) {
    this.selectedChat = chatResponse;
    this.getAllChatMessages(chatResponse.id as string);
    this.setMessagesToSeen();
    //this.selectedChat.unreadCount = 0;
  }

  private getAllChatMessages(chatId: string) {
    this.messageService.getMessages({
      'chat-id': chatId
    }).subscribe({
      next: (messages: MessageResponse[]) => {
        this.chatMessages = messages;
      }
    });
  }

  private setMessagesToSeen() {

  }

  isSelfMessage(message: MessageResponse): boolean {
    return message.senderId === this.keycloakService.userId;
  }
}
