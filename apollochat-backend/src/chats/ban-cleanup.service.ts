import { Injectable } from '@nestjs/common';
import { ChatsRepository } from './chats.repository';

@Injectable()
export class BanCleanupService {
  constructor(private readonly chatsRepository: ChatsRepository) {}

  // Manual method to clean up expired bans
  async cleanupExpiredBans() {
    const now = new Date();

    // Find all chats with potentially expired bans
    const chats = await this.chatsRepository.model.find({
      bannedUsers: { $exists: true, $ne: {} },
    });

    for (const chat of chats) {
      if (!chat.bannedUsers) continue;

      const updates = {};
      let hasUpdates = false;

      // Check each banned user
      for (const [userId, banInfo] of Object.entries(chat.bannedUsers)) {
        if (banInfo.until && new Date(banInfo.until) < now) {
          updates[`bannedUsers.${userId}`] = '';
          hasUpdates = true;
        }
      }

      if (hasUpdates) {
        await this.chatsRepository.model.updateOne(
          { _id: chat._id },
          { $unset: updates },
        );
      }
    }
  }
}
