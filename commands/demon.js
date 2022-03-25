// @ts-check

const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js')
const { default: fetch } = require('node-fetch');

const { backtick, newline } = require("../data/text.json");
const { top3, top5, top10, mainList, legacyList, extendedList } = require('../data/emojis.json');

function mapDemons(arr) {
	return arr.map(demon => `${backtick}#${demon.position}${backtick} ${demon.position < 4 ? top3 : (demon.position < 6 ? top5 : (demon.position < 11 ? top10 : (demon.position < 76 ? mainList : (demon.position < 151 ? extendedList : legacyList))))} **${demon.name}** - ${demon.publisher.name} (${demon.level_id})`).join(newline)
}

function embed(interaction, param, data) {
	try {
		const requestUser = interaction.user;

		let infoEmbed = [];

		infoEmbed.push(
			new MessageEmbed()
				.setTitle("List demons")
				.setAuthor({ name: `${requestUser.username}`, iconURL: requestUser.avatarURL() })
				.setThumbnail('https://raw.githubusercontent.com/GDColon/GDBrowser/master/assets/trophies/1.png')
				.setColor("YELLOW")
				.setDescription(`Type ${backtick}/demoninfo <position>${backtick} to get more information about a demon.`)
		);

		if (data.length == 0) {
			infoEmbed[0].setDescription(`Demon #${param.from + 1} doesn't exist!`)
				.setColor("RED");
			return infoEmbed;
		}

		infoEmbed[0].addField(`Viewing **#${param.from + 1}** to **#${param.from + data.length}**`,
			mapDemons(data.slice(0, 10))
			, false);
		for (let i = 1; i < Math.ceil(data.length / 10); i++) {
			const demon = data.slice(i * 10, i * 10 + 10);
			infoEmbed.push(
				new MessageEmbed()
					.setColor("YELLOW")
					.setThumbnail("https://cdn.discordapp.com/attachments/955467433697746984/955713034972700682/blank.png")
					.setDescription(mapDemons(demon))
			);
		}

		infoEmbed[infoEmbed.length - 1]
			.setFooter({ text: `Viewing ${data.length} demons`, iconURL: "https://raw.githubusercontent.com/GDColon/GDBrowser/master/assets/demonleaderboard.png" })
			.setTimestamp();

		return infoEmbed;
	} catch (err) {
		console.log(err);
		return undefined;
	}
}

async function info(interaction) {
	try {
		const from = interaction.options.getNumber('from') == null ?
			1 :
			(interaction.options.getNumber('from') - 1 < 0 ? 0 : interaction.options.getNumber('from') - 1);
		const count = interaction.options.getNumber('count') == null ? 10 :
			(interaction.options.getNumber('count') > 30 ? 30 :
				(interaction.options.getNumber('count') < 3 ? 3 : interaction.options.getNumber('count')));

		const param = {
			from: from,
			limit: count,
		}

		const url = `https://pointercrate.com/api/v2/demons/listed?after=${param.from}&limit=${param.limit}`;

		// boutta get those demons

		const result = await fetch(url)
			.then(res => res.json())
			.catch(err => console.log(err));

		return embed(interaction, param, result);
	} catch (err) {
		console.log(err);
		return undefined;
	}
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('demon')
		.setDescription('Get demons from the list')
		.addNumberOption(option =>
			option.setName('from')
				.setRequired(false)
				.setDescription("Demon position to start from")
		)
		.addNumberOption(option =>
			option.setName('count')
				.setRequired(false)
				.setDescription("Number of demons to get")
		),

	async execute(interaction) {
		// @ts-ignore
		await interaction.reply(`<@${interaction.user.id}> Working on it...`);
		let result = await info(interaction);
		if (result == undefined) {
			// @ts-ignore
			await interaction.editReply({ content: ":x: An error occured!", embeds: [], components: [], ephemeral: false });
		}
		// @ts-ignore
		await interaction.editReply({ content: "Done!", embeds: result, components: [], ephemeral: false });
	}
};
