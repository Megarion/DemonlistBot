// @ts-check

const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { default: fetch } = require('node-fetch');

const { newline, backtick } = require("../data/text.json");
const { approved, rejected, under_consideration, submitted, top3, top5, top10, mainList, extendedList, legacyList } = require('../data/emojis.json');

const { getYoutubeThumbnail } = require('../functions/youtubeThumbnail.js')

function embed(param, dataMin, data) {
    const player = data;

    const infoEmbed = new MessageEmbed()
        .setTitle("List record information")
        .setThumbnail('https://raw.githubusercontent.com/GDColon/GDBrowser/master/assets/difficulties/demon-extreme-epic.png')
        .setColor("GREEN")

    if (data == null) {
        infoEmbed.setDescription(`Player **#${param.from + 1}** doesn't exist!`)
            .setColor("RED");
        return [infoEmbed];
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
        infoEmbed.setDescription(`Can't find record!`)
            .setColor("RED");
        return [infoEmbed];
    }

    infoEmbed.setDescription(`Viewing ${dataMin[0].name}'s record${newline}${chosenRecord.demon.position < 4 ? top3 : (chosenRecord.demon.position < 6 ? top5 : (chosenRecord.demon.position < 11 ? top10 : (chosenRecord.demon.position < 76 ? mainList : (chosenRecord.demon.position < 151 ? extendedList : legacyList))))} ${backtick}#${chosenRecord.demon.position}${backtick} **${chosenRecord.demon.name}**`);

    infoEmbed.setImage(getYoutubeThumbnail(chosenRecord.video));
    infoEmbed.addField("Progress", `${chosenRecord.progress}%`, true);
    infoEmbed.addField("Status", `${chosenRecord.status == "approved" ? approved : (chosenRecord.status == "rejected" ? rejected : (chosenRecord.status == "submitted" ? submitted : under_consideration))}`, true);
    infoEmbed.addField("Video", `${chosenRecord.video}`, false);

    infoEmbed.setFooter({ text: `Viewing ${dataMin[0].name}'s record on #${param.demon} (Pointercrate ID: ${chosenRecord.id})`, iconURL: "https://raw.githubusercontent.com/GDColon/GDBrowser/master/assets/demonleaderboard.png" })
        .setTimestamp();

    return [infoEmbed];
}

async function info(args) {
    const from = args[0] == null ? 1 :
        ((isNaN(Number(args[0])) ? 1 : args[0]) - 1 < 0 ? 1 : (isNaN(Number(args[0])) ? 1 : args[0]) - 1);

    const demon = args[1] == null ? 0 :
        ((isNaN(Number(args[1])) ? 1 : args[1]) - 1 < 0 ? 1 : (isNaN(Number(args[1])) ? 1 : args[1]) - 1);

    const param = {
        demon: demon,
        from: from,
        limit: 1,
    }

    const url = `https://pointercrate.com/api/v1/players/ranking?after=${param.from}&limit=${param.limit}`;

    const result = await fetch(url)
        .then(res => res.json())
        .catch(err => console.log(err));

    if (result.length > 0) {
        const playerURL = `https://pointercrate.com/api/v1/players/${result[0].id}`;

        const detailed = await fetch(playerURL)
            .then(res => res.json())
            .catch(err => console.log(err));

        return embed(param, result, detailed.data);
    }

    return embed(param, result, null);
}

module.exports = {
    name: "playerrecord",
    aliases: ["pr", "playerrecordinfo"],
    argsName: ["player_pos", "demon_pos"],
    description: "Get a player's record on a demon",
    async execute(message, args) {
        const reply = await message.reply("Working on it...");

        for (let i = args.length; i < this.argsName.length; i++) {
            args.push(null);
        }

        let result = await info(args);

        reply.edit({ content: "Done!", embeds: result, components: [], ephemeral: false });
    }
};