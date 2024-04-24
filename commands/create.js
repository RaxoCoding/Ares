const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const db = require("../db");

async function chatCmdHandler(client, interaction) {
  const channel = interaction.options.getChannel("channel");
  const name = interaction.options.getString("name");
  const description = interaction.options.getString("description");
  const date = interaction.options.getString("date");
  const time = interaction.options.getString("time");
  const eventDate = new Date(date + " " + time);
  const location = interaction.options.getString("location");
  const maxParticipants = interaction.options.getInteger("max-participants");
  const minParticipants = interaction.options.getInteger("min-participants");

  if (maxParticipants < 0) {
    return await interaction.reply({
      content: "The maximum number of participants must be greater than 0!",
      ephemeral: true,
    });
  }

  if (minParticipants < 0) {
    return await interaction.reply({
      content: "The minimum number of participants must be greater than 0!",
      ephemeral: true,
    });
  }

  if (maxParticipants !== 0 && minParticipants > maxParticipants) {
    return await interaction.reply({
      content:
        "The minimum number of participants must be less than the maximum number of participants!",
      ephemeral: true,
    });
  }

  if (isNaN(eventDate)) {
    return await interaction.reply({
      content: "Invalid date and time format!",
      ephemeral: true,
    });
  }

  if (eventDate < new Date()) {
    return await interaction.reply({
      content: "The date and time must be in the future!",
      ephemeral: true,
    });
  }

  const eventEmbed = new EmbedBuilder()
    .setTitle(name)
    .setDescription(description)
    .addFields([
      { name: "Date", value: `<t:${eventDate.getTime() / 1000}:F>` },
      {
        name: "Location",
        value: `[${location}](https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          location
        )})`,
      },
      { name: "Max Participants", value: `${maxParticipants}`, inline: true },
      { name: "Min Participants", value: `${minParticipants}`, inline: true },
      { name: "Current Participants :", value: " " },
    ])
    .setFooter({
      text: `Event created by ${interaction.user.tag}`,
      iconURL: interaction.user.displayAvatarURL(),
    })
    .setTimestamp();

  const join = new ButtonBuilder()
    .setCustomId("create-join")
    .setLabel("Join")
    .setStyle(ButtonStyle.Success);

  const leave = new ButtonBuilder()
    .setCustomId("create-leave")
    .setLabel("Leave")
    .setStyle(ButtonStyle.Danger);

  const row = new ActionRowBuilder().addComponents(join, leave);

  const message = await channel.send({
    embeds: [eventEmbed],
    components: [row],
  });

  const participantIds = [];

  const event = {
    name,
    description,
    date: eventDate,
    location,
    maxParticipants,
    minParticipants,
    participantIds,
    messageId: message.id,
    creatorId: interaction.user.id,
  };

  await db.event.create({ data: event });

  await interaction.reply({
    content: "Event created successfully!",
    ephemeral: true,
  });
}

async function buttonPressHandler(client, interaction) {
  const userId = interaction.user.id;
  const messageId = interaction.message.id;

  const event = await db.event.findFirst({
    where: { messageId },
  });

  if (interaction.customId === "create-join") {
    if (event.participantIds.includes(userId)) {
      return await interaction.reply({
        content: "You are already a participant!",
        ephemeral: true,
      });
    }

    if (event.maxParticipants !== 0 && event.participantIds.length >= event.maxParticipants) {
      return await interaction.reply({
        content: "The event is full!",
        ephemeral: true,
      });
    }

    event.participantIds.push(userId);

    await db.event.update({
      where: { messageId },
      data: { participantIds: { push: userId } },
    });

    await interaction.reply({
      content: "You have joined the event!",
      ephemeral: true,
    });

  } else if (interaction.customId === "create-leave") {
    if (!event.participantIds.includes(userId)) {
      return await interaction.reply({
        content: "You are not a participant!",
        ephemeral: true,
      });
    }

    event.participantIds = event.participantIds.filter((id) => id !== userId);

    await db.event.update({
      where: { messageId },
      data: { participantIds: { set: event.participantIds.filter((id) => id !== userId) } },
    });

    await interaction.reply({
      content: "You have left the event!",
      ephemeral: true,
    });
  }
  
  const message = await interaction.channel.messages.fetch(messageId);
  const eventEmbed = message.embeds[0];
  const row = message.components[0];

  const participantField = eventEmbed.fields.find((field) => field.name === "Current Participants :");
  const participantIds = event.participantIds;
  const participants = participantIds.map((id) => `<@${id}>`);

  participantField.value = participants.join("\n");

  await message.edit({ embeds: [eventEmbed], components: [row] });
}

async function run(client, interaction) {
  if (interaction.isChatInputCommand()) {
    await chatCmdHandler(client, interaction);
  } else if (interaction.isButton()) {
    await buttonPressHandler(client, interaction);
  }
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
