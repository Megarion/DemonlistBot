// @ts-check

const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { default: fetch } = require('node-fetch');

const { backtick, newline } = require("../data/text.json");
const { demonButton, approved, rejected, submitted, under_consideration } = require('../data/emojis.json');

function mapDemons(arr, s) {
	return arr.map((record, index) => `${backtick}#${index + 1 + s}${backtick} ${record.status == "approved" ? approved : (record.status == "rejected" ? rejected : (record.status == "submitted" ? submitted : under_consideration))} ${record.nationality == null ? ":question:" : ":flag_" + record.nationality.country_code.toLowerCase() + ":"} **${record.player.name}** - ${record.progress == 100 ? "**" + record.progress + "%**" : record.progress + "%"}${newline}${record.video}`).join(newline)
}

function embed(interaction, param, data, re) {
	try {
		const requestUser = interaction.user;

		let infoEmbed = [];

		let records = re.slice((param.page - 1) * 10, (param.page - 1) * 10 + 10);

		infoEmbed.push(
			new MessageEmbed()
				.setAuthor({ name: `${requestUser.username}`, iconURL: requestUser.avatarURL() })
				.setThumbnail('https://raw.githubusercontent.com/GDColon/GDBrowser/master/assets/trophies/1.png')
				.setColor("YELLOW")
		);

		if (records.length == 0 || data.length == 0) {
			infoEmbed[0].setDescription(`Record or demon doesn't exist!`)
				.setColor("RED");
			return infoEmbed;
		}

		infoEmbed[0].setTitle(`Records for ${data[0].name}`);

		infoEmbed[0].addField(`Viewing **#${(param.page - 1) * 10 + 1}** to **#${(param.page - 1) * 10 + records.length}**`,
			mapDemons(records.slice(0, 5), (param.page - 1) * 10)
			, false);
		for (let i = 1; i < Math.ceil(records.length / 5); i++) {
			const record = records.slice(i * 5, i * 5 + 5);
			infoEmbed.push(
				new MessageEmbed()
					.setColor("YELLOW")
					.setThumbnail("https://cdn.discordapp.com/attachments/955467433697746984/955713034972700682/blank.png")
					.setDescription(mapDemons(record, (param.page - 1) * 10 + i * 5))
			);
		}

		infoEmbed[infoEmbed.length - 1]
			.setFooter({ text: `Viewing ${records.length} records`, iconURL: "https://raw.githubusercontent.com/GDColon/GDBrowser/master/assets/demonleaderboard.png" })
			.setTimestamp();

		return infoEmbed;
	} catch (err) {
		console.log(err);
		return undefined;
	}
}

async function info(interaction) {
	try {
		const page = interaction.options.getNumber('page') == null ? 1 :
			(interaction.options.getNumber('page') < 1 ? 1 : interaction.options.getNumber('page'));
		const demon = interaction.options.getNumber('position') == null ? 0 :
			(interaction.options.getNumber('position') - 1 < 0 ? 1 : interaction.options.getNumber('position') - 1);

		const param = {
			page: page,
			from: demon,
			limit: 1,
		}

		const url = `https://pointercrate.com/api/v2/demons/listed?after=${param.from}&limit=${param.limit}`;

		// boutta get those demons

		const result = await fetch(url)
			.then(res => res.json())
			.catch(err => console.log(err));

		let records;

		if (result.length != 0) {
			const recordsURL = `https://pointercrate.com/api/v2/demons/${result[0].id}`;

			// get in game stats

			records = await fetch(recordsURL)
				.then(res => res.json())
				.catch(err => console.log(err));
		} else {
			records = [];
			return [embed(interaction, param, result, records), null];
		}

		return [embed(interaction, param, result, records.data.records), result[0].id];
	} catch (err) {
		console.log(err);
		return undefined;
	}
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('demonrecords')
		.setDescription('Get a demon\'s records')
		.addNumberOption(option =>
			option.setName('position')
				.setRequired(false)
				.setDescription("Demon position")
		)
		.addNumberOption(option =>
			option.setName('page')
				.setRequired(false)
				.setDescription('List page number')
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
		} // Embeds

		if (result[1] != null) {
			const row = new MessageActionRow()
				.addComponents(
					viewButton
				);
			viewButton.setURL(`https://megarion.github.io/DemonlistBot/pointercrate.html?type=demon&id=${result[1]}`);

			// @ts-ignore
			await interaction.editReply({ content: "Done!", embeds: result[0], components: [row], ephemeral: false });
		} else {
			// @ts-ignore
			await interaction.editReply({ content: "Done!", embeds: result[0], components: [], ephemeral: false });
		}
	}
};
