import {Component, input, InputSignal, output} from '@angular/core';
import {ChatResponse} from "../../services/models/chat-response";
import {DatePipe} from "@angular/common";
import {UserResponse} from "../../services/models/user-response";
import {UserService} from "../../services/services/user.service";
import {ChatService} from "../../services/services/chat.service";
import {KeycloakService} from "../../utils/keycloak/keycloak.service";

@Component({
  selector: 'app-chat-list',
  imports: [
    DatePipe
  ],
  templateUrl: './chat-list.component.html',
  standalone: true,
  styleUrl: './chat-list.component.scss'
})
export class ChatListComponent {

  chats: InputSignal<ChatResponse[]> = input<ChatResponse[]>([]);
  searchNewContact: boolean = false;
  contacts: Array<UserResponse> = [];
  chatSelected = output<ChatResponse>();

  constructor(
    private userService: UserService,
    private chatService: ChatService,
    private keycloakService: KeycloakService
  ) {}

  searchContact() {
    this.userService.getAllUsers()
      .subscribe({
        next: (users: UserResponse[]) => {
          this.contacts = users;
          this.searchNewContact = true;
        }
      })
  }

  chatClicked(chat: ChatResponse) {
    this.chatSelected.emit(chat);
  }

  wrapMessage(lastMessage: string | undefined): string {
    if (!lastMessage) {
      return '';
    }
    if (lastMessage && lastMessage.length <= 20) {
      return lastMessage;
    }
    return lastMessage?.substring(0, 17) + '...';
  }

  selectContact(contact: UserResponse) {
    this.chatService.createChat({
      "sender-id": this.keycloakService.userId as string,
      "receiver-id": contact.id as string
    }).subscribe({
      next: (res) => {
        const chatResponse: ChatResponse = {
          id: res.response,
          name: contact.firstName + " " + contact.lastName,
          recipientOnline: contact.online,
          lastMessageTime: contact.lastSeen,
          senderId: this.keycloakService.userId,
          receiverId: contact.id
        };
        this.chats().unshift(chatResponse);
        this.searchNewContact = false;
        this.chatSelected.emit(chatResponse);
      }
    });
  }
}
