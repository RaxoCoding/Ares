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

	const user = interaction.options.getUser("user");
	if (!event.participantIds.includes(user.id)) {
		return await interaction.reply({
			content: "User is not a participant!",
			ephemeral: true,
		});
	}

	event.participantIds = event.participantIds.filter((id) => id !== user.id);
	await db.event.update({
		where: { messageId },
		data: { participantIds: { set: event.participantIds } },
	});

  const eventEmbed = message.embeds[0];
  const row = message.components[0];

  const participantField = eventEmbed.fields.find((field) => field.name === "Current Participants :");
  const participantIds = event.participantIds;
  const participants = participantIds.map((id) => `<@${id}>`);

  participantField.value = participants.join("\n");

  await message.edit({ embeds: [eventEmbed], components: [row] });

	await interaction.reply({
		content: "User removed from event!",
		ephemeral: true,
	});
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Removes a user from an event")
    .addStringOption((option) =>
      option
        .setName("event-id")
        .setDescription("The messageId of the event to remove the user from")
        .setRequired(true)
    )
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to remove from the event")
        .setRequired(true)
    ),
  run,
};
