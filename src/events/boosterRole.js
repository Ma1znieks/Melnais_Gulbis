import { Events } from 'discord.js';
import { logger } from '../utils/logger.js';

const BOOSTER_ROLE_ID = process.env.BOOSTER_ROLE_ID;

export default {
  name: Events.GuildMemberUpdate,
  async execute(oldMember, newMember) {
    if (!BOOSTER_ROLE_ID) return;

    const startedBoosting = !oldMember.premiumSince && Boolean(newMember.premiumSince);
    const stoppedBoosting = Boolean(oldMember.premiumSince) && !newMember.premiumSince;

    if (!startedBoosting && !stoppedBoosting) return;

    const role = newMember.guild.roles.cache.get(BOOSTER_ROLE_ID);
    if (!role) {
      logger.warn(`Booster role ${BOOSTER_ROLE_ID} was not found in guild ${newMember.guild.id}`);
      return;
    }

    try {
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
