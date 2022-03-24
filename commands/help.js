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
	const timestamp = new Date().getTime();

	const requestUser = interaction.user;

	const infoEmbed = new MessageEmbed()
		.setTitle("PlayerlistBot")
		.setDescription("A bot to view the Geometry Dash Playerlist!")
		.setThumbnail('https://raw.githubusercontent.com/GDColon/GDBrowser/master/assets/demonleaderboard.png')
		.setColor("BLUE")
		.setTimestamp()
		.setFooter({ text: `Help information` });

	// infoEmbed.addField('COMMANDS', "", false);

	return infoEmbed;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('PlayerlistBot information'),
	/**
	 * @param {{ reply: (arg0: { embeds: MessageEmbed[]; components: MessageActionRow[]; ephemeral: boolean; }) => any; }} interaction
	 */
	async execute(interaction) {
		const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setLabel('Playerlist')
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
					.setURL('https://github.com/Megarion/PlayerlistBot'),
			);

		return interaction.reply({ embeds: [info(interaction)], components: [row], ephemeral: true });
	}
};
