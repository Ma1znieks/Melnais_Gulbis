import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { updateGuildConfig } from '../../services/config/guildConfig.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';

export default {
  data: new SlashCommandBuilder()
    .setName('auto-role-booster')
    .setDescription('Iestata automātisko servera boostera lomu')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName('ieslegt')
        .setDescription('Ieslēdz automātisko boostera lomu')
        .addRoleOption(option =>
          option.setName('loma')
            .setDescription('Loma, ko piešķirt servera boosteriem')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('izslegt')
        .setDescription('Izslēdz automātisko boostera lomu')),
  category: 'Moderation',

  async execute(interaction, config, client) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'ieslegt') {
      const role = interaction.options.getRole('loma');
      if (role.managed || role.id === interaction.guild.id) {
        return InteractionHelper.universalReply(interaction, {
          content: 'Šo lomu nevar izmantot boostera lomai.',
          ephemeral: true,
        });
      }

      await updateGuildConfig(client, interaction.guild.id, {
        boosterRoleEnabled: true,
        boosterRoleId: role.id,
      });

      return InteractionHelper.universalReply(interaction, {
        content: `✅ Automātiskā boostera loma ieslēgta! ${role} tiks piešķirta, kad dalībnieks sāks boostot serveri.`,
        ephemeral: true,
      });
    }

    await updateGuildConfig(client, interaction.guild.id, {
      boosterRoleEnabled: false,
    });

    return InteractionHelper.universalReply(interaction, {
      content: '✅ Automātiskā boostera loma izslēgta.',
      ephemeral: true,
    });
  },
};
