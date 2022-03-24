// @ts-check

const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js')
const { default: fetch } = require('node-fetch');

const { backtick, newline } = require("../data/text.json");
// const { } = require('../data/emojis.json');

function mapPlayers(arr) {
	return arr.map(player => `${backtick}#${player.rank}${backtick} ${player.nationality == null ? ":question:" : ":flag_" + player.nationality.country_code.toLowerCase() + ":"} **${player.name}** - ${player.score.toFixed(2)}`).join(newline)
}

function embed(interaction, param, data) {
	try {
		const requestUser = interaction.user;

		let infoEmbed = [];

		infoEmbed.push(
			new MessageEmbed()
				.setTitle("List players")
				.setAuthor({ name: `${requestUser.username}`, iconURL: requestUser.avatarURL() })
				.setThumbnail('https://raw.githubusercontent.com/GDColon/GDBrowser/master/assets/trophies/1.png')
				.setColor("YELLOW")
				.setDescription(`Type ${backtick}/playerinfo <position>${backtick} to get more information about a player.`)
		);

		if (data.length == 0) {
			infoEmbed[0].setDescription(`Player #${param.from + 1} doesn't exist!`)
				.setColor("RED");
			return infoEmbed;
		}

		infoEmbed[0].addField(`Viewing **#${param.from + 1}** to **#${param.from + data.length}**`,
			mapPlayers(data.slice(0, 10))
			, false);
		for (let i = 1; i < Math.ceil(data.length / 10); i++) {
			const players = data.slice(i * 10, i * 10 + 10);
			infoEmbed.push(
				new MessageEmbed()
					.setColor("YELLOW")
					.setThumbnail("https://cdn.discordapp.com/attachments/955467433697746984/955713034972700682/blank.png")
					.setDescription(mapPlayers(players))
			);
		}

		infoEmbed[infoEmbed.length - 1]
			.setFooter({ text: `Viewing ${data.length} players`, iconURL: "https://raw.githubusercontent.com/GDColon/GDBrowser/master/assets/demonleaderboard.png" })
			.setTimestamp();

		return infoEmbed;
	} catch (err) {
		console.log(err);
		interaction.editReply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
}

async function info(interaction) {
	const from = interaction.options.getNumber('from') == null ?
		1 :
		(interaction.options.getNumber('from') - 1 < 0 ? 1 : interaction.options.getNumber('from') - 1);
	const count = interaction.options.getNumber('count') == null ? 10 :
		(interaction.options.getNumber('count') > 30 ? 30 :
			(interaction.options.getNumber('count') < 3 ? 3 : interaction.options.getNumber('count')));

	const param = {
		from: from,
		limit: count,
	}

	const url = `https://pointercrate.com/api/v1/players/ranking?after=${param.from}&limit=${param.limit}`;

	// boutta get those players

	const result = await fetch(url)
		.then(res => res.json())
		.catch(err => console.log(err));

	return embed(interaction, param, result);
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('player')
		.setDescription('Get players from the leaderboard')
		.addNumberOption(option =>
			option.setName('from')
				.setRequired(false)
				.setDescription("Player position to start from")
		)
		.addNumberOption(option =>
			option.setName('count')
				.setRequired(false)
				.setDescription("Number of players to get")
		),

	async execute(interaction) {
		// @ts-ignore
		await interaction.reply(`<@${interaction.user.id}> Working on it...`);
		let result = await info(interaction);
		// @ts-ignore
		await interaction.editReply({ content: "Done!", embeds: result, components: [], ephemeral: false });
	}
};
