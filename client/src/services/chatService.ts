import api from '../utils/api';
import type { Conversation, Message, Connection, ConnectionStatusResponse } from '../types/chat';

// ── Conversations ──────────────────────────────────────────────────────────────

export const getConversations = async (): Promise<Conversation[]> => {
    const res = await api.get('/chat/conversations');
    return res.conversations;
};

export const getMessages = async (
    conversationId: string,
    page = 1,
    limit = 30
): Promise<{ messages: Message[]; pagination: { page: number; pages: number; total: number } }> => {
    const res = await api.get(`/chat/messages/${conversationId}?page=${page}&limit=${limit}`);
    return { messages: res.messages, pagination: res.pagination };
};

export const sendMessageREST = async (
    conversationId: string,
    text: string
): Promise<Message> => {
    const res = await api.post('/chat/messages', { conversationId, text });
    return res.message;
};

// ── Connections ────────────────────────────────────────────────────────────────

export const getConnections = async (): Promise<{
    accepted: Connection[];
    pending: Connection[];
    sent: Connection[];
}> => {
    const res = await api.get('/connections');
    return { accepted: res.accepted, pending: res.pending, sent: res.sent };
};

export const sendConnectionRequest = async (recipientId: string): Promise<Connection> => {
    const res = await api.post('/connections/request', { recipientId });
    return res.connection;
};

export const respondToRequest = async (
    connectionId: string,
    action: 'accepted' | 'declined'
): Promise<{ connection: Connection; conversation?: Conversation }> => {
    const res = await api.post('/connections/respond', { connectionId, action });
    return { connection: res.connection, conversation: res.conversation };
};

export const getConnectionStatus = async (
    userId: string
): Promise<ConnectionStatusResponse> => {
    const res = await api.get(`/connections/status/${userId}`);
    return res;
};
