const { SlashCommandBuilder } = require('discord.js');

async function run(client, interaction) {
	const helpResponse = `Here are the commands you can use:
- /help: Shows this message
- /ping: Replies with Pong!
- /create: Creates a new event
- /delete: Deletes an event
- /remove: Removes a user from an event`;

	await interaction.reply(helpResponse);
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Help'),
	run
}