// @ts-check

const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { default: fetch } = require('node-fetch');

const { trueResult, falseResult, unclearResult, backtick, newline } = require("../data/text.json");
const { demonButton, top3, top5, top10, mainList, legacyList, extendedList, like, dislike, download, time, silvercoin, bronzecoin } = require('../data/emojis.json');

function embed(interaction, param, data, gameData) {
	const timestamp = new Date().getTime();

	const requestUser = interaction.user;

	const player = data[0];

	const infoEmbed = new MessageEmbed()
		.setTitle("List player information")
		.setAuthor({ name: `${requestUser.username}`, iconURL: requestUser.avatarURL() })
		.setThumbnail('https://raw.githubusercontent.com/GDColon/GDBrowser/master/assets/difficulties/player-extreme-epic.png')
		.setColor("GREEN")
		.setTimestamp()

	if (data.length == 0) {
		infoEmbed.setDescription(`Player **#${param.from + 1}** doesn't exist!`)
			.setColor("RED");
		return infoEmbed;
	}

	infoEmbed.addField(`Viewing **#${param.from + 1}**`, `${player.nationality == null? "" : ":flag_" + player.nationality.country_code.toLowerCase() + ":"} **${player.name}**`, false);
	infoEmbed.addField(`Description`, `> *${gameData.description}*`, false);
	infoEmbed.addField(`Downloads`, `${download} ${gameData.downloads}`, true);
	infoEmbed.addField(`Likes`, `${gameData.disliked ? dislike : like} ${Math.abs(gameData.likes)}`, true);
	infoEmbed.addField(`Length`, `${time} ${gameData.length}`, true);
	infoEmbed.addField(`Coins`, `${gameData.coins == 0 ? unclearResult : (gameData.verifiedCoins ? silvercoin.repeat(gameData.coins) : bronzecoin.repeat(gameData.coins))}`, true);
	infoEmbed.addField(`Requirement`, `${player.requirement}%`, false);
	infoEmbed.addField(`Video`, `${player.video == null ? unclearResult : player.video}`, false);
	infoEmbed.addField(`Verifier`, `${player.verifier.name}`, false);


	infoEmbed.setFooter({ text: `Viewing #${player.position}`, iconURL: "https://raw.githubusercontent.com/GDColon/GDBrowser/master/assets/demonleaderboard.png" });

	return infoEmbed;
}

async function info(interaction) {
	const from = interaction.options.getNumber('position') == null ? 0 :
		(interaction.options.getNumber('position') - 1 < 0 ? 0 : interaction.options.getNumber('position') - 1);

	const param = {
		from: from,
		limit: 1,
	}

	const url = `https://pointercrate.com/api/v1/players/ranking?after=${param.from}&limit=${param.limit}`;

	// boutta get those players

	const result = await fetch(url)
		.then(res => res.json())
		.catch(err => err);

	return [embed(interaction, param, result), result[0].id];
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
		const viewButton = new MessageButton()
			.setLabel('View this level!')
			.setStyle('LINK')
			.setEmoji(demonButton)

		// @ts-ignore
		await interaction.reply(`<@${interaction.user.id}> Working on it...`);
		let result = await info(interaction); // Embed, Pointercrate ID

		viewButton.setURL(`https://megarion.github.io/DemonlistBot/pointercrate.html?type=player&id=${result[1]}`);

		const row = new MessageActionRow()
			.addComponents(
				viewButton
			);

		// @ts-ignore
		await interaction.editReply({ content: "Done!", embeds: [result[0]], components: [row], ephemeral: false });
	}
};
