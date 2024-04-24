const events = require("./events");
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
  client.on(event.name, async (...args) => event.run(client, ...args));
}

client.login(TOKEN);

// Catch exit signals
process.on("SIGINT", () => {
  console.log("Shutting down...");
  client.destroy();
  db.$disconnect();
  process.exit();
});
