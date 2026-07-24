export interface ConversationParticipant {
    _id: string;
    name: string;
    avatarUrl: string;
}

export interface MessageSender {
    _id: string;
    name: string;
    avatarUrl: string;
}

export interface Message {
    _id: string;
    conversationId: string;
    sender: MessageSender;
    text: string;
    read: boolean;
    edited: boolean;
    timestamp: string;
}

export interface LastMessage {
    text: string;
    sender: string;
    timestamp: string;
    read: boolean;
}

export interface Conversation {
    _id: string;
    participants: ConversationParticipant[];
    updatedAt: string;
    lastMessage: LastMessage | null;
    unreadCount: number;
}

export interface Connection {
    _id: string;
    requester: ConversationParticipant;
    recipient: ConversationParticipant;
    status: 'pending' | 'accepted' | 'declined';
    createdAt: string;
    updatedAt: string;
}

export interface ConnectionStatusResponse {
    success: boolean;
    connection: Connection | null;
}
