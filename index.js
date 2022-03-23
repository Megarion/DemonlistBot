// @ts-check

const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { token } = require('./config.json');

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// @ts-ignore
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	// @ts-ignore
	client.commands.set(command.data.name, command);
}

client.once('ready', () => {
	console.log('Bot is ready!');

	client.user.setPresence({
		status: "dnd",
		activities:[
			{name: "/help", type: "WATCHING"}
		]
	});
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	// @ts-ignore
	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.login(token);