// @ts-check

const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { default: fetch } = require('node-fetch');

const { backtick, newline } = require("../data/text.json");
const { approved, rejected, under_consideration, submitted } = require('../data/emojis.json');

const { getYoutubeThumbnail } = require("../functions/youtubeThumbnail.js");

function embed(interaction, param, dataMin, data) {
	try {
		const requestUser = interaction.user;

		const player = data;

		const infoEmbed = new MessageEmbed()
			.setTitle("List record information")
			.setAuthor({ name: `${requestUser.username}`, iconURL: requestUser.avatarURL() })
			.setThumbnail('https://raw.githubusercontent.com/GDColon/GDBrowser/master/assets/difficulties/demon-extreme-epic.png')
			.setColor("GREEN")

		if (data == null) {
			infoEmbed[0].setDescription(`Player **#${param.from + 1}** doesn't exist!`)
				.setColor("RED");
			return infoEmbed;
		}

		let chosenRecord = undefined;

		for (let i = 0; i < player.records.length; i++) {
			const record = player.records[i];
			if (record.demon.position == param.demon + 1) {
				chosenRecord = record;
				break;
			}
		}

		if (chosenRecord == undefined) {
			infoEmbed[0].setDescription(`Can't find record!`)
				.setColor("RED");
			return infoEmbed;
		}

		infoEmbed.setDescription(`Viewing ${dataMin[0].name}'s record on ${chosenRecord.demon.name}`);

		infoEmbed.setImage(getYoutubeThumbnail(chosenRecord.video));
		infoEmbed.addField("Progress", `${chosenRecord.progress}%`, true);
		infoEmbed.addField("Status", `${chosenRecord.status == "approved" ? approved : (chosenRecord.status == "rejected" ? rejected : (chosenRecord.status == "submitted" ? submitted : under_consideration))}`, true);
		infoEmbed.addField("Video", `${chosenRecord.video}`, false);

		infoEmbed.setFooter({ text: `Viewing ${dataMin[0].name}'s record on #${param.demon} (Pointercrate ID: ${chosenRecord.id})`, iconURL: "https://raw.githubusercontent.com/GDColon/GDBrowser/master/assets/demonleaderboard.png" })
			.setTimestamp();

		return infoEmbed;
	} catch (err) {
		console.log(err);
		return undefined;
	}
}

async function info(interaction) {
	try {
		const from = interaction.options.getNumber('position') == null ? 1 :
			(interaction.options.getNumber('position') - 1 < 0 ? 1 : interaction.options.getNumber('position') - 1);

		const demon = interaction.options.getNumber('demon') == null ? 1 :
			(interaction.options.getNumber('demon') - 1 < 0 ? 1 : interaction.options.getNumber('demon') - 1);

		const param = {
			demon: demon,
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

		return embed(interaction, param, result, null);
	} catch (err) {
		console.log(err);
		return undefined;
	}
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('playerrecord')
		.setDescription("Shows more information about a player's record")
		.addNumberOption(option =>
			option.setName('position')
				.setRequired(false)
				.setDescription("Player position")
		).addNumberOption(option =>
			option.setName('demon')
				.setRequired(false)
				.setDescription("Demon position")
		),
	/**
	 * @param {{ reply: (arg0: { embeds: MessageEmbed[]; components: MessageActionRow[]; ephemeral: boolean; }) => any; }} interaction
	 */
	async execute(interaction) {
		// @ts-ignore
		await interaction.reply(`<@${interaction.user.id}> Working on it...`);
		let result = await info(interaction);
		if (result == undefined) {
			// @ts-ignore
			await interaction.editReply({ content: ":x: An error occured!", embeds: [], components: [], ephemeral: false });
		} // Embed(s)

		// @ts-ignore
		await interaction.editReply({ content: "Done!", embeds: [result], components: [], ephemeral: false });
	}
};
