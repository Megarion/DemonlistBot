// @ts-check

const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { default: fetch } = require('node-fetch');

const { unclearResult, backtick } = require("../data/text.json");
const { demonButton, top3, top5, top10, mainList, legacyList, extendedList, download, dislike, like, time, silvercoin, bronzecoin } = require('../data/emojis.json');

const { getYoutubeThumbnail } = require('../functions/youtubeThumbnail');

function embed(interaction, param, dataMin, gameData, data) {
	try {
		const requestUser = interaction.user;

		const demon = data;

		const infoEmbed = new MessageEmbed()
			.setTitle("List demon information")
			.setAuthor({ name: `${requestUser.username}`, iconURL: requestUser.avatarURL() })
			.setThumbnail('https://raw.githubusercontent.com/GDColon/GDBrowser/master/assets/difficulties/demon-extreme-epic.png')
			.setColor("GREEN")
			.setTimestamp()

		if (dataMin.length == 0) {
			infoEmbed.setDescription(`Demon **#${param.from + 1}** doesn't exist!`)
				.setColor("RED");
			return infoEmbed;
		}

		infoEmbed.setDescription(`Type ${backtick}/demonrecords <position>${backtick} to get records of a demon.`);

		infoEmbed.setImage(getYoutubeThumbnail(demon.video));

		infoEmbed.addField(`Viewing **#${param.from + 1}**`, `${demon.position < 4 ? top3 : (demon.position < 6 ? top5 : (demon.position < 11 ? top10 : (demon.position < 76 ? mainList : (demon.position < 151 ? extendedList : legacyList))))} **${demon.name}** - ${demon.publisher.name}`, false);
		infoEmbed.addField(`Level ID`, `${demon.level_id}`, false);
		infoEmbed.addField(`Description`, `> *${gameData.description}*`, false);
		infoEmbed.addField(`Creators`, `> ${data.creators.map(creator => ` ${creator.name}`)}`, false);
		infoEmbed.addField(`Downloads`, `${download} ${gameData.downloads}`, true);
		infoEmbed.addField(`Likes`, `${gameData.disliked ? dislike : like} ${Math.abs(gameData.likes)}`, true);
		infoEmbed.addField(`Length`, `${time} ${gameData.length}`, true);
		infoEmbed.addField(`Coins`, `${gameData.coins == 0 ? unclearResult : (gameData.verifiedCoins ? silvercoin.repeat(gameData.coins) : bronzecoin.repeat(gameData.coins))}`, true);
		infoEmbed.addField(`Requirement`, `${demon.requirement}%`, false);
		infoEmbed.addField(`Video`, `${demon.video == null ? unclearResult : demon.video}`, false);
		infoEmbed.addField(`Verifier`, `${demon.verifier.name}`, false);

		infoEmbed.setFooter({ text: `Viewing #${demon.position} (Pointercrate ID: ${demon.id})`, iconURL: "https://raw.githubusercontent.com/GDColon/GDBrowser/master/assets/demonleaderboard.png" });

		return infoEmbed;
	} catch (err) {
		console.log(err);
		return undefined;
	}
}

async function info(interaction) {
	try {
		const from = interaction.options.getNumber('position') == null ? 0 :
			(interaction.options.getNumber('position') - 1 < 0 ? 0 : interaction.options.getNumber('position') - 1);

		const param = {
			from: from,
			limit: 1,
		}

		const url = `https://pointercrate.com/api/v2/demons/listed?after=${param.from}&limit=${param.limit}`;

		// boutta get those demons

		const result = await fetch(url)
			.then(res => res.json())
			.catch(err => console.log(err));

		if (result.length != 0) {
			const inGameURL = `https://gdbrowser.com/api/level/${result[0].level_id}`;

			// get in game stats

			const inGame = await fetch(inGameURL)
				.then(res => res.json())
				.catch(err => console.log(err));

			const detailedURL = `https://pointercrate.com/api/v2/demons/${result[0].id}`

			const detailed = await fetch(detailedURL)
				.then(res => res.json())
				.catch(err => console.log(err));

			return [embed(interaction, param, result, inGame, detailed.data), result[0].id];
		} else {
			return [embed(interaction, param, result, null, null), null];
		}
	} catch (err) {
		console.log(err);
		return undefined;
	}
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('demoninfo')
		.setDescription("Get a demon's information from the list")
		.addNumberOption(option =>
			option.setName('position')
				.setRequired(false)
				.setDescription("Demon position")
		),
	/**
	 * @param {{ reply: (arg0: { embeds: MessageEmbed[]; components: MessageActionRow[]; ephemeral: boolean; }) => any; }} interaction
	 */
	async execute(interaction) {
		const viewButton = new MessageButton()
			.setLabel('View this level!')
			.setStyle('LINK')
			.setEmoji(demonButton)

		// @ts-ignore
		await interaction.reply(`<@${interaction.user.id}> Working on it...`);
		let result = await info(interaction);
		if (result == undefined) {
			// @ts-ignore
			await interaction.editReply({ content: ":x: An error occured!", embeds: [], components: [], ephemeral: false });
		} // Embed, Pointercrate ID

		if (result[1] != null) {
			viewButton.setURL(`https://megarion.github.io/DemonlistBot/pointercrate.html?type=demon&id=${result[1]}`);

			const row = new MessageActionRow()
				.addComponents(
					viewButton
				);

			// @ts-ignore
			await interaction.editReply({ content: "Done!", embeds: [result[0]], components: [row], ephemeral: false });
		} else {
			// @ts-ignore
			await interaction.editReply({ content: "Done!", embeds: [result[0]], components: [], ephemeral: false });
		}
	}
};
