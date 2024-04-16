const events = require("./events");
const commands = require("./commands");
const db = require("./db");
const { Client, GatewayIntentBits } = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const { TOKEN } = require("./config");

// Register all events
for (const event of events) {
  client.on(event.name, async () => event.run(client));
}

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = commands.find(
    (cmd) => cmd.data.name === interaction.commandName
  );

  if (!command) return;

  try {
    await command.run(client, interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }

  console.log(
    `${interaction.user.tag} in #${interaction.channel.name} ran command ${command.data.name}.`
  );
});

client.login(TOKEN);

// Catch exit signals
process.on("SIGINT", () => {
  console.log("Shutting down...");
  client.destroy();
  db.$disconnect();
  process.exit();
});
