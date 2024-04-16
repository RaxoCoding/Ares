const { REST, Routes } = require('discord.js');
const { TOKEN } = require('../config');

async function run(client) {
  console.log(`Logged in as ${client.user.tag}!`);

	// Register all commands
	const commands = require('../commands');

	const rest = new REST({ version: '10' }).setToken(TOKEN);

	try {
		console.log('Started refreshing application (/) commands.');

		await rest.put(
			Routes.applicationCommands(client.user.id),
			{ body: commands.map(command => command.data) }
		);

		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
};

module.exports = {
	name: 'ready',
	run
}