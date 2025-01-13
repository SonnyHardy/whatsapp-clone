package com.sonny.whatsappclone.chat;

import com.sonny.whatsappclone.common.BaseAuditingEntity;
import com.sonny.whatsappclone.message.Message;
import com.sonny.whatsappclone.message.MessageState;
import com.sonny.whatsappclone.message.MessageType;
import com.sonny.whatsappclone.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "chat")
@NamedQuery(name = ChatConstants.FIND_CHAT_BY_SENDER_ID,
        query = "select chat from Chat chat where chat.sender.id = :senderId or chat.recipient.id = :senderId order by createdDate desc")
@NamedQuery(name = ChatConstants.FIND_CHAT_BY_SENDER_ID_AND_RECEIVER_ID,
           query = "select chat from Chat chat where (chat.sender.id = :senderId and chat.recipient.id = :recipientId) or (chat.sender.id = :recipientId and chat.recipient.id = :senderId)")
public class Chat extends BaseAuditingEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "sender_id")
    private User sender;

    @ManyToOne
    @JoinColumn(name = "recipient_id")
    private User recipient;

    @OneToMany(mappedBy = "chat", fetch = FetchType.EAGER)
    @OrderBy("createdDate DESC")
    private List<Message> messages;

    @Transient
    public String getChatName(final String senderId) {
        if (recipient.getId().equals(senderId)) {
            return sender.getFirstName() + " " + sender.getLastName();
        }
        return recipient.getFirstName() + " " + recipient.getLastName();
    }

    @Transient
    public long getUnreadMessages(final String senderId) {
        return messages
                .stream()
                .filter(msg -> msg.getReceiverId().equals(senderId))
                .filter(msg -> MessageState.SENT == msg.getState())
                .count();
    }

    @Transient
    public String getLastMessage() {
        if (messages != null && !messages.isEmpty()) {
            if (messages.getFirst().getType() != MessageType.TEXT) {
                return "Attachment";
            }
            return messages.getFirst().getContent();
        }
        return null;
    }

    @Transient
    public LocalDateTime getLastMessageTime() {
        if (messages != null && !messages.isEmpty()) {
            return messages.getFirst().getCreatedDate();
        }
        return null;
    }
}
