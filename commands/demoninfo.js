// @ts-check

const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js')
const { default: fetch } = require('node-fetch');

const { trueResult, falseResult, unclearResult, backtick, newline } = require("../data/text.json");
const { demonButton, top3, top5, top10, mainList, legacyList, extendedList, like, dislike, download, time, silvercoin, bronzecoin } = require('../data/emojis.json');

const { getYoutubeThumbnail } = require('../functions/youtubeThumbnail');

function embed(interaction, param, data, gameData) {
	const timestamp = new Date().getTime();

	const requestUser = interaction.user;

	const demon = data[0];

	const infoEmbed = new MessageEmbed()
		.setTitle("List demon information")
		.setAuthor({ name: `${requestUser.username}`, iconURL: requestUser.avatarURL() })
		.setThumbnail('https://raw.githubusercontent.com/GDColon/GDBrowser/master/assets/difficulties/demon-extreme-epic.png')
		.setColor("GREEN")
		.setTimestamp()
		.setImage(getYoutubeThumbnail(demon.video));

	if (data.length == 0) {
		infoEmbed.setDescription(`Demon **#${param.from + 1}** doesn't exist!`)
			.setColor("RED");
		return infoEmbed;
	}

	infoEmbed.addField(`Viewing **#${param.from + 1}**`, `${demon.position < 4 ? top3 : (demon.position < 6 ? top5 : (demon.position < 11 ? top10 : (demon.position < 76 ? mainList : (demon.position < 151 ? extendedList : legacyList))))} **${demon.name}** - ${demon.publisher.name}`, false);
	infoEmbed.addField(`Level ID`, `${demon.level_id}`, false);
	infoEmbed.addField(`Description`, `> *${gameData.description}*`, false);
	infoEmbed.addField(`Downloads`, `${download} ${gameData.downloads}`, true);
	infoEmbed.addField(`Likes`, `${gameData.disliked ? dislike : like} ${Math.abs(gameData.likes)}`, true);
	infoEmbed.addField(`Length`, `${time} ${gameData.length}`, true);
	infoEmbed.addField(`Coins`, `${gameData.coins == 0 ? unclearResult : (gameData.verifiedCoins ? silvercoin.repeat(gameData.coins) : bronzecoin.repeat(gameData.coins))}`, true);
	infoEmbed.addField(`Requirement`, `${demon.requirement}%`, false);
	infoEmbed.addField(`Video`, `${demon.video == null ? unclearResult : demon.video}`, false);
	infoEmbed.addField(`Verifier`, `${demon.verifier.name}`, false);


	infoEmbed.setFooter({ text: `Viewing #${demon.position}`, iconURL: "https://raw.githubusercontent.com/GDColon/GDBrowser/master/assets/demonleaderboard.png" });

	return infoEmbed;
}

async function info(interaction) {
	const from = interaction.options.getNumber('position') == null ? 0 :
		(interaction.options.getNumber('position') - 1 < 0 ? 0 : interaction.options.getNumber('position') - 1);

	const param = {
		from: from,
		limit: 1,
	}

	const url = `https://pointercrate.com/api/v2/demons/listed?after=${param.from}&limit=${param.limit}`;

	// boutta get those demons
	// https://pointercrate.com/api/v2/demons/listed?after=<number>&limit=<number>

	/* EXAMPLE RESPONSE
		{
			id: 379,
			position: 3,
			name: 'Firework',
			requirement: 49,
			video: 'https://www.youtube.com/watch?v=QBe5x2o9v2w',
			publisher: { id: 36915, name: 'Trick', banned: false },
			verifier: { id: 36915, name: 'Trick', banned: false },
			level_id: 75206202
		},
	*/

	const result = await fetch(url)
		.then(res => res.json())
		.catch(err => err);

	const inGameURL = `https://gdbrowser.com/api/level/${result[0].level_id}`;

	// get these in game stats
	// https://gdbrowser.com/api/level/<id>

	/* EXAMPLE RESPONSE
		{
			"name": "Nine Circles",
			"id": "4284013",
			"description": "Easy",
			"author": "Zobros",
			"playerID": "957447",
			"accountID": "2379",
			"difficulty": "Hard Demon",
			"downloads": 30523740,
			"likes": 1898461,
			"disliked": false,
			"length": "Long",
			"stars": 10,
			"orbs": 500,
			"diamonds": 12,
			"featured": true,
			"epic": false,
			"gameVersion": "2.0",
			"editorTime": 0,
			"totalEditorTime": 0,
			"version": 5,
			"copiedID": "0",
			"twoPlayer": false,
			"officialSong": 0,
			"customSong": 533927,
			"coins": 3,
			"verifiedCoins": true,
			"starsRequested": 0,
			"ldm": false,
			"objects": 0,
			"large": false,
			"cp": 2,
			"difficultyFace": "demon-hard-featured",
			"songName": "NK - Nine Circles",
			"songAuthor": "Rukkus",
			"songSize": "7.76MB",
			"songID": 533927,
			"songLink": "http://audio.ngfiles.com/533000/533927_NK---Nine-Circles.mp3"
		}
	*/

	const inGame = await fetch(inGameURL)
		.then(res => res.json())
		.catch(err => err);

	return embed(interaction, param, result, inGame);
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
			.setURL('https://pointercrate.com/demonlist/');

		const row = new MessageActionRow()
			.addComponents(
				viewButton
			);
		
		// @ts-ignore
		await interaction.reply(`<@${interaction.user.id}> Working on it...`);
		let result = await info(interaction);
		// @ts-ignore
		await interaction.editReply({ content: "Done!", embeds: [result], components: [row], ephemeral: false });
	}
};
