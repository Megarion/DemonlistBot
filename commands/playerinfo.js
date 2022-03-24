// @ts-check

const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { default: fetch } = require('node-fetch');

const { unclearResult, backtick, newline } = require("../data/text.json");
// const { } = require('../data/emojis.json');

function embed(interaction, param, dataMin, data) {
	try {
		const requestUser = interaction.user;

		const player = data;

		const infoEmbed = [];
		infoEmbed.push(
			new MessageEmbed()
				.setTitle("List player information")
				.setAuthor({ name: `${requestUser.username}`, iconURL: requestUser.avatarURL() })
				.setThumbnail('https://raw.githubusercontent.com/GDColon/GDBrowser/master/assets/difficulties/demon-extreme-epic.png')
				.setColor("GREEN")
		);

		if (data.length == 0) {
			infoEmbed[0].setDescription(`Player **#${param.from + 1}** doesn't exist!`)
				.setColor("RED");
			return infoEmbed;
		}

		infoEmbed[0].setDescription(`Viewing player **#${param.from + 1}** ${player.banned ? `(:no_entry_sign: ${backtick}Banned${backtick})` : ""}`);

		infoEmbed[0].addField(`Name`, `**${player.name}**`, true);
		infoEmbed[0].addField(`List points`, `${dataMin[0].score.toFixed(2)}`, true);
		infoEmbed[0].addField(`Nationality`, `${player.nationality == null ? unclearResult : ":flag_" + player.nationality.country_code.toLowerCase() + ": " + player.nationality.nation}`, true);

		let completedRecords = [];
		let uncompletedRecords = [];
		for (let i = 0; i < player.records.length; i++) {
			const record = player.records[i];
			if (record.status == "approved") {
				if (record.progress == 100) {
					completedRecords.push(record);
				} else {
					uncompletedRecords.push(record);
				}
			}
		}

		// 45 demons per embed!
		// 3 for demons beaten, 1 for verified, created, uncompleted demons
		// will increase these numbers if there are like a billion demons

		completedRecords = completedRecords.reverse();
		uncompletedRecords = uncompletedRecords.reverse();

		function mapRecords(recordsList) {
			return `>${recordsList.map(record => ` ${backtick}${record.demon.position}${backtick} ${record.demon.position > 150 ? record.demon.name : "**" + record.demon.name + "**"}`)}`;
		}

		function mapUncompletedRecords(recordsList) {
			return `>${recordsList.map(record => ` ${backtick}${record.demon.position}${backtick} ${record.demon.position > 150 ? record.demon.name : "**" + record.demon.name + "**"} (${record.progress}%)`)}`;
		}

		function mapDemons(demonsList) {
			return `>${demonsList.map(demon => ` ${backtick}${demon.position}${backtick} ${demon.position > 150 ? demon.name : "**" + demon.name + "**"}`)}`;
		}

		if (completedRecords.length > 0) {
			infoEmbed.push(
				new MessageEmbed()
					.addField(`**${completedRecords.length}** demons completed`, mapRecords(completedRecords.slice(0, 40)), false)
					.setColor("GREEN")
			);
			for (let i = 1; i < Math.ceil(completedRecords.length / 40); i++) {
				const demons = completedRecords.slice(i * 40, (i + 1) * 40);
				infoEmbed.push(
					new MessageEmbed()
						.setColor("GREEN")
						.setDescription(mapRecords(demons))
				)
			}
		}

		if (uncompletedRecords.length > 0) {
			infoEmbed.push(
				new MessageEmbed()
					.addField(`**${uncompletedRecords.length}** demons progressed`, mapUncompletedRecords(uncompletedRecords.slice(0, 40)), false)
					.setColor("GREEN")
			);
			for (let i = 1; i < Math.ceil(uncompletedRecords.length / 40); i++) {
				const demons = uncompletedRecords.slice(i * 40, (i + 1) * 40);
				infoEmbed.push(
					new MessageEmbed()
						.setColor("GREEN")
						.setDescription(mapUncompletedRecords(demons))
				)
			}
		}

		if (player.verified.length > 0) {
			infoEmbed.push(
				new MessageEmbed()
					.addField(`**${player.verified.length}** demons verified`, mapDemons(player.verified.slice(0, 40)), false)
					.setColor("GREEN")
			);
			for (let i = 1; i < Math.ceil(player.verified.length / 40); i++) {
				const demons = player.verified.slice(i * 40, (i + 1) * 40);
				infoEmbed.push(
					new MessageEmbed()
						.setColor("GREEN")
						.setDescription(mapDemons(demons))
				)
			}
		}

		if (player.created.length > 0) {
			infoEmbed.push(
				new MessageEmbed()
					.addField(`**${player.created.length}** demons created`, mapDemons(player.created.slice(0, 40)), false)
					.setColor("GREEN")
			);
			for (let i = 1; i < Math.ceil(player.created.length / 40); i++) {
				const demons = player.created.slice(i * 40, (i + 1) * 40);
				infoEmbed.push(
					new MessageEmbed()
						.setColor("GREEN")
						.setDescription(mapDemons(demons))
				)
			}
		}

		if (player.published.length > 0) {
			infoEmbed.push(
				new MessageEmbed()
					.addField(`**${player.published.length}** demons published`, mapDemons(player.published.slice(0, 40)), false)
					.setColor("GREEN")
			);
			for (let i = 1; i < Math.ceil(player.published.length / 40); i++) {
				const demons = player.published.slice(i * 40, (i + 1) * 40);
				infoEmbed.push(
					new MessageEmbed()
						.setColor("GREEN")
						.setDescription(mapDemons(demons))
				)
			}
		}

		infoEmbed[infoEmbed.length - 1].setFooter({ text: `Viewing #${dataMin[0].rank} (Pointercrate ID: ${player.id})`, iconURL: "https://raw.githubusercontent.com/GDColon/GDBrowser/master/assets/demonleaderboard.png" })
			.setTimestamp();

		return infoEmbed;
	} catch (err) {
		console.log(err);
		interaction.editReply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
}

async function info(interaction) {
	try {
		const from = interaction.options.getNumber('position') == null ? 1 :
			(interaction.options.getNumber('position') - 1 < 0 ? 1 : interaction.options.getNumber('position') - 1);

		const param = {
			from: from,
			limit: 1,
		}

		const url = `https://pointercrate.com/api/v1/players/ranking?after=${param.from}&limit=${param.limit}`;

		// boutta get those players

		const result = await fetch(url)
			.then(res => res.json())
			.catch(err => console.log(err));

		if (result.length > 0) {
			const playerURL = `https://pointercrate.com/api/v1/players/${result[0].id}`;

			const detailed = await fetch(playerURL)
				.then(res => res.json())
				.catch(err => console.log(err));

			return embed(interaction, param, result, detailed.data);
		}

		return embed(interaction, param, result, []);
	} catch (err) {
		console.log(err);
		interaction.editReply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('playerinfo')
		.setDescription("Get a player's information from the list")
		.addNumberOption(option =>
			option.setName('position')
				.setRequired(false)
				.setDescription("Player position")
		),
	/**
	 * @param {{ reply: (arg0: { embeds: MessageEmbed[]; components: MessageActionRow[]; ephemeral: boolean; }) => any; }} interaction
	 */
	async execute(interaction) {
		// @ts-ignore
		await interaction.reply(`<@${interaction.user.id}> Working on it...`);
		let result = await info(interaction); // Embed(s)

		// @ts-ignore
		await interaction.editReply({ content: "Done!", embeds: result, components: [], ephemeral: false });
	}
};
