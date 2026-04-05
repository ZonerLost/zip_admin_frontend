import { ConversationModel, IConversation, IMessage, MessageModel } from "../models/chat.model";
import mongoose from "mongoose";

export class ChatRepository {
  async findOrCreateConversation(
    participantA: string,
    participantB: string,
    itemId?: string
  ): Promise<IConversation> {
    const existing = await ConversationModel.findOne({
      participants: { $all: [participantA, participantB] },
      ...(itemId ? { item: itemId } : {}),
    });
    if (existing) return existing;

    return ConversationModel.create({
      participants: [participantA, participantB],
      item: itemId,
      unreadCount: { [participantA]: 0, [participantB]: 0 },
    });
  }

  async getConversations(userId: string): Promise<IConversation[]> {
    return ConversationModel.find({ participants: userId })
      .populate("participants", "firstName lastName profilePhoto")
      .populate("item", "title photos")
      .sort({ updatedAt: -1 });
  }

  async getConversationById(id: string, userId: string): Promise<IConversation | null> {
    return ConversationModel.findOne({
      _id: id,
      participants: userId,
    })
      .populate("participants", "firstName lastName profilePhoto")
      .populate("item", "title photos");
  }

  async getMessages(
    conversationId: string,
    page = 1,
    limit = 30
  ): Promise<{ messages: IMessage[]; total: number }> {
    const [messages, total] = await Promise.all([
      MessageModel.find({
        conversation: conversationId,
        deletedAt: { $exists: false },
      })
        .populate("sender", "firstName lastName profilePhoto")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      MessageModel.countDocuments({
        conversation: conversationId,
        deletedAt: { $exists: false },
      }),
    ]);
    // Return in chronological order
    return { messages: messages.reverse(), total };
  }

  async createMessage(data: {
    conversationId: string;
    senderId: string;
    content: string;
  }): Promise<IMessage> {
    const message = await MessageModel.create({
      conversation: data.conversationId,
      sender: data.senderId,
      content: data.content,
    });

    // Update conversation lastMessage and unread count
    await ConversationModel.findByIdAndUpdate(data.conversationId, {
      lastMessage: {
        content: data.content,
        sender: data.senderId,
        createdAt: new Date(),
      },
      $inc: { [`unreadCount.${data.senderId}`]: 0 }, // sender stays 0
      updatedAt: new Date(),
    });

    // Increment unread for other participants
    const conversation = await ConversationModel.findById(data.conversationId);
    if (conversation) {
      for (const p of conversation.participants) {
        if (p.toString() !== data.senderId) {
          await ConversationModel.findByIdAndUpdate(data.conversationId, {
            $inc: { [`unreadCount.${p.toString()}`]: 1 },
          });
        }
      }
    }

    return message.populate("sender", "firstName lastName profilePhoto");
  }

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    await Promise.all([
      MessageModel.updateMany(
        { conversation: conversationId, sender: { $ne: userId }, isRead: false },
        { isRead: true }
      ),
      ConversationModel.findByIdAndUpdate(conversationId, {
        [`unreadCount.${userId}`]: 0,
      }),
    ]);
  }

  async deleteMessage(messageId: string, userId: string): Promise<IMessage | null> {
    return MessageModel.findOneAndUpdate(
      { _id: messageId, sender: userId },
      { deletedAt: new Date() },
      { new: true }
    );
  }
}