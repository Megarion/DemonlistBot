// @ts-check

const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { default: fetch } = require('node-fetch');

const { newline, backtick } = require("../data/text.json");
const { demonFace, coin, arrow_right } = require('../data/emojis.json');

function embed(args, commands, prefix) {
    const page = args[0] == null ? 1 : ((isNaN(Number(args[0])) ? 1 : args[0]) < 1 ? 1 : (isNaN(Number(args[0])) ? 1 : args[0]));

    let today = new Date();
    let d = today.getDate();
    let m = today.getMonth() + 1;

    const infoEmbed = new MessageEmbed()
        .setTitle("DemonlistBot")
        .setDescription("A bot to view the Geometry Dash Demonlist!")
        .setThumbnail('https://raw.githubusercontent.com/GDColon/GDBrowser/master/assets/demonleaderboard.png')
        .setColor("BLUE")
        .setTimestamp()
        .setFooter({ text: `Page ${page}` });

    // April Fools
    if (d == 1 && m == 4) {
        infoEmbed.addField("April Fools!", "On every April Fools, the Demonlist will have changes to the levels");
    }

    infoEmbed.addField(`Prefix`, `${prefix}`, false);

    const data = commands.slice((page - 1) * 10, page * 10);
    if (data.length < 1) {
        infoEmbed.addField("Commands", `No commands found`);
        return [infoEmbed];
    }

    let content = "";
    for (let i = 0; i < data.length; i++) {
        let args = `<${data[i].argsName.join("> <")}>`;
        let aliases = data[i].aliases.join("/");

        content += `${arrow_right} ${backtick}${data[i].name} ${data[i].argsName.length < 1 ? "" : args}${backtick}\nAliases: ${backtick}${aliases}${backtick}\n`;
    }

    infoEmbed.addField(`Commands`, `${content}`, false);

    return [infoEmbed];
}

module.exports = {
    name: 'help',
    aliases: ['h', 'command', 'commands'],
    argsName: ["page"],
    description: 'Help information',
    async execute(message, args, commands, prefix) {
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
        await message.reply({ content: "Done!", embeds: await embed(args, commands, prefix), components: [row], ephemeral: true });
    }
};