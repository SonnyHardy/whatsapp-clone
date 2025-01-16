import {Component, OnInit} from '@angular/core';
import {ChatListComponent} from "../../components/chat-list/chat-list.component";
import {ChatResponse} from "../../services/models/chat-response";
import {ChatService} from "../../services/services/chat.service";
import {KeycloakService} from "../../utils/keycloak/keycloak.service";
import {MessageService} from "../../services/services/message.service";
import {MessageResponse} from "../../services/models/message-response";
import {DatePipe} from "@angular/common";
import {PickerComponent} from "@ctrl/ngx-emoji-mart";
import {FormsModule} from "@angular/forms";
import {EmojiData} from "@ctrl/ngx-emoji-mart/ngx-emoji";
import {MessageRequest} from "../../services/models/message-request";
import * as Stomp from "stompjs";
import SockJS from "sockjs-client";

@Component({
  selector: 'app-main',
  imports: [
    ChatListComponent,
    DatePipe,
    PickerComponent,
    FormsModule
  ],
  templateUrl: './main.component.html',
  standalone: true,
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit{

  chats: Array<ChatResponse> = [];
  selectedChat: ChatResponse = {};
  chatMessages: MessageResponse[] = [];
  showEmojis: boolean = false;
  messageContent: string = '';
  socketClient: any = null;
  private notificationSubscription: any;

  constructor(
    private chatService: ChatService,
    private keycloakService: KeycloakService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initWebSocket();
    this.getAllChats();
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
    this.selectedChat.unreadCount = 0;
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
    this.messageService.setMessagesToSeen({
      'chat-id': this.selectedChat.id as string
    }).subscribe({
      next: () => {}
    });
  }

  isSelfMessage(message: MessageResponse): boolean {
    return message.senderId === this.keycloakService.userId;
  }

  uploadMedia(target: EventTarget | null) {

  }

  onSelectEmojis(selectedEmoji: any) {
    const emoji: EmojiData = selectedEmoji.emoji;
    this.messageContent += emoji.native;
  }

  keyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.sendMessage();
    }
  }

  onClick() {
    this.setMessagesToSeen();
  }

  sendMessage() {
    if (this.messageContent) {
      const messageRequest: MessageRequest = {
        chatId: this.selectedChat.id,
        senderId: this.getSenderId(),
        receiverId: this.getReceiverId(),
        content: this.messageContent,
        type: "TEXT"
      };
      this.messageService.saveMessage({
        body: messageRequest
      }).subscribe({
        next: () => {
          const messageResponse: MessageResponse = {
            senderId: this.getSenderId(),
            receiverId: this.getReceiverId(),
            content: this.messageContent,
            type: "TEXT",
            state: "SENT",
            createdAt: new Date().toString()
          }
          this.selectedChat.lastMessage = this.messageContent;
          this.chatMessages.push(messageResponse);
          this.messageContent = "";
          this.showEmojis = false;
        }
      });
    }
  }

  private getSenderId(): string {
    if (this.selectedChat.senderId === this.keycloakService.userId) {
      return this.selectedChat.senderId as string;
    }
    return this.selectedChat.receiverId as string;
  }

  private getReceiverId(): string {
    if (this.selectedChat.senderId === this.keycloakService.userId) {
      return this.selectedChat.receiverId as string;
    }
    return this.selectedChat.senderId as string;
  }

  private initWebSocket() {
    if (this.keycloakService.keycloak.tokenParsed?.sub) {
      let websocket = new SockJS('http://localhost:8088/websocket');
      this.socketClient = Stomp.over(websocket);
      const subUrl = `/user/${this.keycloakService.keycloak.tokenParsed?.sub}/chat`;
      this.socketClient.connect({'Authorization': `Bearer ${this.keycloakService.keycloak.token}`},
        () => {
          this.notificationSubscription = this.socketClient.subscribe(subUrl,
            (message: any)=> {
              const notification: Notification = JSON.parse(message.body);
            },
            () => console.error("Error while connecting to webSocket")
          );
        }
      );
    }
  }
}
