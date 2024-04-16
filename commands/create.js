const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../db");

async function run(client, interaction) {
  const channel = interaction.options.getChannel("channel");
  const name = interaction.options.getString("name");
  const description = interaction.options.getString("description");
  const date = interaction.options.getString("date");
  const time = interaction.options.getString("time");
  const location = interaction.options.getString("location");
  const maxParticipants = interaction.options.getInteger("max-participants");
  const minParticipants = interaction.options.getInteger("min-participants");

  const participantIds = [];

  const event = {
    name,
    description,
    date: new Date(date + " " + time),
    location,
    maxParticipants,
    minParticipants,
    participantIds,
  };

  await db.event.create({ data: event });

  const eventEmbed = new EmbedBuilder()
    .setTitle(name)
    .setDescription(description)
    .addFields([
      { name: "Date", value: date, inline: true },
      { name: "Time", value: time, inline: true },
      { name: "Location", value: location, inline: true },
      { name: "Max Participants", value: `${maxParticipants}`, inline: true },
      { name: "Min Participants", value: `${minParticipants}`, inline: true },
    ])
    .setFooter({
      text: `Event created by ${interaction.user.tag}`,
      iconURL: interaction.user.displayAvatarURL(),
    })
    .setTimestamp();

  await channel.send({ embeds: [eventEmbed] });

	await interaction.reply({
		content: "Event created successfully!",
		ephemeral: true,
	});
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("create")
    .setDescription("Create an event!")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel to create the event in")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("The name of the event")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("date")
        .setDescription("The date of the event (YYYY-MM-DD)")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("time")
        .setDescription("The time of the event (HH:MM)")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("location")
        .setDescription(
          "The location of the event (e.g. '123 Main St, City, State, Zip')"
        )
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("max-participants")
        .setDescription("The maximum number of participants (0 for unlimited)")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("min-participants")
        .setDescription("The minimum number of participants")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("The description of the event")
    ),
  run,
};
