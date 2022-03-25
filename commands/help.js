// @ts-check

const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { demonFace, coin } = require('../data/emojis.json');
const { backtick, newline } = require("../data/text.json");

/*
	For embeds: 
	- RED = Error
	- YELLOW = List
	- GREEN = Info
*/

function info(interaction) {
	try {
		let today = new Date();
		let d = today.getDate();
		let m = today.getMonth() + 1;
		console.log(d, m);

		const infoEmbed = new MessageEmbed()
			.setTitle("DemonlistBot")
			.setDescription("A bot to view the Geometry Dash Demonlist!")
			.setThumbnail('https://raw.githubusercontent.com/GDColon/GDBrowser/master/assets/demonleaderboard.png')
			.setColor("BLUE")
			.setTimestamp()
			.setFooter({ text: `Help information` });

		// April Fools
		if (d == 1 && m == 4) {
			infoEmbed.addField("April Fools!", "On every April Fools, the Demonlist will have changes to the levels!");
		}

		infoEmbed.addField('------------- COMMANDS -------------', "List of availible slash commands you can use:", false);

		infoEmbed.addField(`${backtick}help${backtick}`, "Shows this help message", false);
		infoEmbed.addField(`${backtick}demon <from> <count>${backtick}`, "Shows a list of top demons", false);
		infoEmbed.addField(`${backtick}demoninfo <demonPosition>${backtick}`, "Shows more information about a demon", false);
		infoEmbed.addField(`${backtick}demonrecords <demonPosition> <page>${backtick}`, "Shows the demon leaderboard", false);
		infoEmbed.addField(`${backtick}player <from> <count>${backtick}`, "Shows a list of top players", false);
		infoEmbed.addField(`${backtick}playerinfo <playerPosition>${backtick}`, "Shows more information about a player", false);
		infoEmbed.addField(`${backtick}playerrecord <playerPosition> <demonPosition>${backtick}`, "Shows more information about a player's record", false);

		return infoEmbed;
	} catch (err) {
		console.log(err);
		return undefined;
	}
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('DemonlistBot information'),
	/**
	 * @param {{ reply: (arg0: { embeds: MessageEmbed[]; components: MessageActionRow[]; ephemeral: boolean; }) => any; }} interaction
	 */
	async execute(interaction) {
		const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setLabel('Demonlist')
					.setStyle('LINK')
					.setEmoji(demonFace)
					.setURL('https://pointercrate.com/demonlist/'),
				new MessageButton()
					.setLabel('GDBrowser')
					.setStyle('LINK')
					.setEmoji(coin)
					.setURL('https://gdbrowser.com/'),
				new MessageButton()
					.setLabel('GitHub')
					.setStyle('LINK')
					.setURL('https://github.com/Megarion/DemonlistBot'),
			);

		return interaction.reply({ embeds: [info(interaction)], components: [row], ephemeral: true });
	}
};
