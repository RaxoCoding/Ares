const { SlashCommandBuilder } = require("discord.js");
const db = require("../db");

async function run(client, interaction) {
  const messageId = interaction.options.getString("event-id");
  const channel = interaction.channel;
  const message = await channel.messages.fetch(messageId);

  const event = await db.event.findFirst({
    where: { messageId },
  });

  if (!event) {
    return await interaction.reply(`No event with id ${messageId}`, {
      ephemeral: true,
    });
  }

  if (
    event.creatorId !== interaction.user.id &&
    !interaction.member.permissions.has("ADMINISTRATOR")
  ) {
    return await interaction.reply(
      `You are not the creator of the event with id ${messageId}`,
      { ephemeral: true }
    );
  }

  await message.delete();
  await db.event.delete({ where: { messageId } });

  await interaction.reply(`Deleted event with id ${messageId}`, {
    ephemeral: true,
  });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("delete")
    .setDescription("Deletes an event")
    .addStringOption((option) =>
      option
        .setName("event-id")
        .setDescription("The messageId of the event to delete")
        .setRequired(true)
    ),
  run,
};
