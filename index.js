// @ts-check

const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { prefix, token, testToken } = require('./config.json');
const { backtick } = require('./data/text.json');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
// @ts-ignore
client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

const commands = [];

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
    // @ts-ignore
	client.commands.set(command.name, command);
    for (const a of command.aliases) {
        // @ts-ignore
        client.commands.set(a, command);
    }
    commands.push(command);
}

client.once('ready', () => {
	console.log('Ready!');

    client.user.setPresence({
		status: "dnd",
		activities:[
			{name: `${prefix}help`, type: "WATCHING"}
		]
	});
});

client.on('messageCreate', message => {
    const request = message.content.toLowerCase();
	if (!request.startsWith(prefix) || message.author.bot) return;

	const args = request.slice(prefix.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();

    // @ts-ignore
	if (!client.commands.has(command)) return;

	try {
        // @ts-ignore
        if (client.commands.get(command).name == "help") {
            // @ts-ignore
            client.commands.get("help").execute(message, args, commands, prefix);
        } else {
            // @ts-ignore
            client.commands.get(command).execute(message, args);
        }
		
	} catch (error) {
		console.error(error);
		message.reply(`An error occured! ${backtick}${backtick}${backtick}${error}${backtick}${backtick}${backtick}`);
	}
});

client.login(testToken);