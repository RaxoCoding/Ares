const commands = require('../commands');

async function run(client, interaction) {
	if (!interaction.isChatInputCommand() && !interaction.isButton()) return;

	let commandName = interaction.commandName;

	if (interaction.isButton()) {
		commandName = interaction.customId;
	}

  const command = commands.find(
    (cmd) => commandName.includes(cmd.data.name)
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
};

module.exports = {
	name: 'interactionCreate',
	run
}