// @ts-check

const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { default: fetch } = require('node-fetch');

const { newline, backtick } = require("../data/text.json");
const { top3, top5, top10, mainList, legacyList, extendedList } = require('../data/emojis.json');

function embed(param, data) {
    let infoEmbed = [];

    infoEmbed.push(
        new MessageEmbed()
            .setTitle("List demons")
            .setThumbnail('https://raw.githubusercontent.com/GDColon/GDBrowser/master/assets/trophies/1.png')
            .setColor("YELLOW")
    );

    if (data.length == 0) {
        infoEmbed[0].setDescription(`Demon #${param.from + 1} doesn't exist!`)
            .setColor("RED");
        return [infoEmbed];
    }

    function mapDemons(arr) {
        return arr.map(demon => `${backtick}#${demon.position}${backtick} ${demon.position < 4 ? top3 : (demon.position < 6 ? top5 : (demon.position < 11 ? top10 : (demon.position < 76 ? mainList : (demon.position < 151 ? extendedList : legacyList))))} **${demon.name}** - ${demon.publisher.name} (${demon.level_id})`).join(newline)
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

    return [infoEmbed];
}

async function info(args) {
    const from = args[0] == null ?
        0 : ((isNaN(Number(args[0])) ? 0 : args[0]) - 1 < 0 ? 0 : (isNaN(Number(args[0])) ? 0 : args[0]) - 1);
    const count = args[1] == null ? 10 :
        ((isNaN(Number(args[1])) ? 10 : args[1]) > 30 ? 30 :
            ((isNaN(Number(args[1])) ? 10 : args[1]) < 3 ? 3 : (isNaN(Number(args[1])) ? 10 : args[1])));

    const param = {
        from: from,
        limit: count,
    }

    const url = `https://pointercrate.com/api/v2/demons/listed?after=${param.from}&limit=${param.limit}`;

    const result = await fetch(url)
        .then(res => res.json())
        .catch(err => console.log(err));

    return embed(param, result);
}

module.exports = {
    name: "demonlist",
    aliases: ["dl", "demons"],
    argsName: ["from", "count"],
    description: "Get demons from the list",
    async execute(message, args) {
        const reply = await message.reply("Working on it...");

        for (let i = args.length; i < this.argsName.length; i++) {
            args.push(null);
        }

        let result = await info(args);

        reply.edit({ content: "Done!", embeds: result[0], components: [], ephemeral: false });
    }
};