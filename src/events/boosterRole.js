import { Events } from 'discord.js';
import { logger } from '../utils/logger.js';
import { getGuildConfig } from '../services/config/guildConfig.js';

export default {
  name: Events.GuildMemberUpdate,
  async execute(oldMember, newMember, client) {
    const startedBoosting = !oldMember.premiumSince && Boolean(newMember.premiumSince);
    const stoppedBoosting = Boolean(oldMember.premiumSince) && !newMember.premiumSince;
    if (!startedBoosting && !stoppedBoosting) return;

    try {
      const config = await getGuildConfig(client, newMember.guild.id);
      if (!config.boosterRoleEnabled || !config.boosterRoleId) return;

      const role = newMember.guild.roles.cache.get(config.boosterRoleId);
      if (!role) {
        logger.warn(`Booster role ${config.boosterRoleId} was not found in guild ${newMember.guild.id}`);
        return;
      }

      if (startedBoosting && !newMember.roles.cache.has(role.id)) {
        await newMember.roles.add(role, 'Automatically assigned for boosting the server');
        logger.info(`Assigned booster role to ${newMember.user.tag} in ${newMember.guild.id}`);
      } else if (stoppedBoosting && newMember.roles.cache.has(role.id)) {
        await newMember.roles.remove(role, 'Removed because server boost ended');
        logger.info(`Removed booster role from ${newMember.user.tag} in ${newMember.guild.id}`);
      }
    } catch (error) {
      logger.error(`Could not update booster role for member ${newMember.id}:`, error);
    }
  },
};
