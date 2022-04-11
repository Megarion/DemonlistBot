// @ts-check

const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { default: fetch } = require('node-fetch');

const { newline, backtick } = require("../data/text.json");
const { approved, rejected, under_consideration, submitted } = require('../data/emojis.json');

function mapDemons(arr, s) {
    return arr.map((record, index) => `${backtick}#${index + 1 + s}${backtick} ${record.status == "approved" ? approved : (record.status == "rejected" ? rejected : (record.status == "submitted" ? submitted : under_consideration))} ${record.nationality == null ? ":question:" : ":flag_" + record.nationality.country_code.toLowerCase() + ":"} **${record.player.name}** - ${record.progress == 100 ? "**" + record.progress + "%**" : record.progress + "%"}${newline}${record.video}`).join(newline)
}

function embed(param, data, re) {
    let infoEmbed = [];

    let records = re.slice((param.page - 1) * 10, (param.page - 1) * 10 + 10);

    infoEmbed.push(
        new MessageEmbed()
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
}

async function info(args) {
    let error = false;

    const page = args[1] == null ? 1 :
        ((isNaN(Number(args[1])) ? 1 : args[1]) < 1 ? 1 : (isNaN(Number(args[1])) ? 1 : args[1]));
    const demon = args[0] == null ? 0 :
        ((isNaN(Number(args[0])) ? 0 : args[0]) - 1 < 0 ? 1 : (isNaN(Number(args[0])) ? 0 : args[0]) - 1);

    const param = {
        page: page,
        from: demon,
        limit: 1,
    }

    const url = `https://pointercrate.com/api/v2/demons/listed?after=${param.from}&limit=${param.limit}`;

    const result = await fetch(url)
        .then(res => res.json())
        .catch(err => error = true);

    let records;

    if (error) {
        return embed(param, result, records);
    }

    if (result.length != 0) {
        const recordsURL = `https://pointercrate.com/api/v2/demons/${result[0].id}`;

        // get in game stats

        records = await fetch(recordsURL)
            .then(res => res.json())
            .catch(err => error = true);
    } else {
        records = [];
        return embed(param, result, records);
    }

    return embed(param, result, records.data.records);
}

module.exports = {
    name: "demonrecord",
    aliases: ["dr", "demonrecords"],
    argsName: ["demon_pos", "page"],
    description: "Get a demon's records",
    async execute(message, args) {
        const reply = await message.reply("Working on it...");

        for (let i = args.length; i < this.argsName.length; i++) {
            args.push(null);
        }

        let result = await info(args);

        reply.edit({ content: "Done!", embeds: result, components: [], ephemeral: false });
    }
};