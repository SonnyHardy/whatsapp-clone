import {Component, input, InputSignal, output} from '@angular/core';
import {ChatResponse} from "../../services/models/chat-response";
import {DatePipe} from "@angular/common";
import {UserResponse} from "../../services/models/user-response";
import {ChatService} from "../../services/services/chat.service";
import {UserService} from "../../services/services/user.service";

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
    private userService: UserService
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

  }
}
