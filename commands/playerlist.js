// @ts-check

const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { default: fetch } = require('node-fetch');

const { newline, backtick } = require("../data/text.json");
// const { } = require('../data/emojis.json');

function mapPlayers(arr) {
    return arr.map(player => `${backtick}#${player.rank}${backtick} ${player.nationality == null ? ":question:" : ":flag_" + player.nationality.country_code.toLowerCase() + ":"} **${player.name}** - ${player.score.toFixed(2)}`).join(newline)
}

function embed(param, data) {
    let infoEmbed = [];

    infoEmbed.push(
        new MessageEmbed()
            .setTitle("List players")
            .setThumbnail('https://raw.githubusercontent.com/GDColon/GDBrowser/master/assets/trophies/1.png')
            .setColor("YELLOW")
    );

    if (data.length == 0) {
        infoEmbed[0].setDescription(`Player #${param.from + 1} doesn't exist!`)
            .setColor("RED");
        return infoEmbed;
    }

    infoEmbed[0].addField(`Viewing **#${param.from + 1}** to **#${param.from + data.length}**`,
        mapPlayers(data.slice(0, 10))
        , false);
    for (let i = 1; i < Math.ceil(data.length / 10); i++) {
        const players = data.slice(i * 10, i * 10 + 10);
        infoEmbed.push(
            new MessageEmbed()
                .setColor("YELLOW")
                .setThumbnail("https://cdn.discordapp.com/attachments/955467433697746984/955713034972700682/blank.png")
                .setDescription(mapPlayers(players))
        );
    }

    infoEmbed[infoEmbed.length - 1]
        .setFooter({ text: `Viewing ${data.length} players`, iconURL: "https://raw.githubusercontent.com/GDColon/GDBrowser/master/assets/demonleaderboard.png" })
        .setTimestamp();

    return infoEmbed;
}

async function info(args) {
    const from = args[0] == null ?
        0 :
        ((isNaN(Number(args[0])) ? 0 : args[0]) - 1 < 0 ? 1 : (isNaN(Number(args[0])) ? 0 : args[0]) - 1);
    const count = args[1] == null ? 10 :
        ((isNaN(Number(args[1])) ? 10 : args[1]) > 30 ? 30 :
            ((isNaN(Number(args[1])) ? 10 : args[1]) < 3 ? 3 : (isNaN(Number(args[1])) ? 10 : args[1])));

    const param = {
        from: from,
        limit: count,
    }

    const url = `https://pointercrate.com/api/v1/players/ranking?after=${param.from}&limit=${param.limit}`;

    const result = await fetch(url)
        .then(res => res.json())
        .catch(err => console.log(err));

    return embed(param, result);
}

module.exports = {
    name: 'playerlist',
    aliases: ['players', 'playerlist', 'pl'],
    argsName: ["from", "count"],
    description: 'Get players from the leaderboard',
    async execute(message, args) {
        const reply = await message.reply("Working on it...");

        for (let i = args.length; i < this.argsName.length; i++) {
            args.push(null);
        }

        let result = await info(args);

        reply.edit({ content: "Done!", embeds: result, components: [], ephemeral: false });
    }
};