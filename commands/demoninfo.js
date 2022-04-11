// @ts-check

const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { default: fetch } = require('node-fetch');

const { unclearResult, backtick } = require("../data/text.json");
const { play, demonButton, top3, top5, top10, mainList, legacyList, extendedList, download, dislike, like, time, silvercoin, bronzecoin } = require('../data/emojis.json');

const { getYoutubeThumbnail } = require('../functions/youtubeThumbnail');

function embed(dataMin, gameData, data) {
    const demon = data;

    const infoEmbed = new MessageEmbed()
        .setTitle("List demon information")
        .setThumbnail('https://raw.githubusercontent.com/GDColon/GDBrowser/master/assets/difficulties/demon-extreme-epic.png')
        .setColor("GREEN")
        .setTimestamp()

    if (dataMin.length == 0) {
        infoEmbed.setDescription(`Demon doesn't exist!`)
            .setColor("RED");
        return [infoEmbed];
    }

    infoEmbed.setImage(getYoutubeThumbnail(demon.video));

    infoEmbed.addField(`Viewing **#${demon.position}**`, `${demon.position < 4 ? top3 : (demon.position < 6 ? top5 : (demon.position < 11 ? top10 : (demon.position < 76 ? mainList : (demon.position < 151 ? extendedList : legacyList))))} **${demon.name}** - ${demon.publisher.name}`, false);

    infoEmbed.addField(`Description`, `> *${gameData.description}*`, true);
    infoEmbed.addField(`Creators`, `> ${data.creators.map(creator => ` ${creator.name}`)}`, true);
    infoEmbed.addField(`Level ID`, `${demon.level_id}`, false);
    infoEmbed.addField(`Downloads`, `${download} ${gameData.downloads}`, true);
    infoEmbed.addField(`Likes`, `${gameData.disliked ? dislike : like} ${Math.abs(gameData.likes)}`, true);
    infoEmbed.addField(`Length`, `${time} ${gameData.length}`, true);
    // infoEmbed.addField(`Coins`, `${gameData.coins == 0 ? unclearResult : (gameData.verifiedCoins ? silvercoin.repeat(gameData.coins) : bronzecoin.repeat(gameData.coins))}`, true);
    infoEmbed.addField(`Requirement`, `${demon.requirement}%`, true);
    infoEmbed.addField(`Verifier`, `${demon.verifier.name}`, true);

    infoEmbed.setFooter({ text: `Viewing #${demon.position} (Pointercrate ID: ${demon.id})`, iconURL: "https://raw.githubusercontent.com/GDColon/GDBrowser/master/assets/demonleaderboard.png" });

    return [infoEmbed];
}

/**
 * @param {any[]} args
 */
async function info(args) {
    const from = args == null ? 0 : ( !isNaN(Number(args))? 
        // @ts-ignore
        (args-1 < 0? 0 : args) : 
        args
    )

    const param = {
        from: from,
        limit: 1,
    }

    let result;

    if (!isNaN(Number(param.from))) {
        const url = `https://pointercrate.com/api/v2/demons/listed?after=${param.from}&limit=${param.limit}`;
        result = await fetch(url)
            .then(res => res.json())
            .catch(err => console.log(err));
    } else {
        let list = [];

        // no while loops allowed (while loops are unbased)
        for (let i = 0; i < 10; i++) {
            const url = `https://pointercrate.com/api/v2/demons/listed?after=${i*100}&limit=100`;
            let r = await fetch(url)
                .then(res => res.json())
                .catch(err => console.log(err));

            // optimize
            if (r.length == 0) {
                break;
            }

            for (let j = 0; j < r.length; j++) {
                list.push(r[j]);
            }
        }

        // @ts-ignore
        let val = list.find(demon => demon.name.toLowerCase() == param.from.toLowerCase());
        result = (val == undefined? [] : [val]);
    }

    if (result.length != 0) {
        const inGameURL = `https://gdbrowser.com/api/level/${result[0].level_id}`;

        // get in game stats

        const inGame = await fetch(inGameURL)
            .then(res => res.json())
            .catch(err => console.log(err));

        const detailedURL = `https://pointercrate.com/api/v2/demons/${result[0].id}`

        const detailed = await fetch(detailedURL)
            .then(res => res.json())
            .catch(err => console.log(err));

        return [embed(result, inGame, detailed.data), result[0].id, result[0].video];
    } else {
        return [embed(result, null, null), null, null];
    }
}

module.exports = {
    name: "demoninfo",
    aliases: ["demon", "d", "di"],
    argsName: ["demon"],
    description: "Get a demon's information from the list",
    async execute(message, args) {
        const reply = await message.reply("Working on it...");

        for (let i = args.length; i < this.argsName.length; i++) {
            args.push(null);
        }

        let result = await info(args.join(" "));

        const row = new MessageActionRow();
        let v = false;

        if (result[1] != null) {
            row.addComponents(
                new MessageButton()
                    .setLabel('View this level!')
                    .setStyle('LINK')
                    .setEmoji(demonButton)
                    .setURL(`https://megarion.github.io/DemonlistBot/pointercrate.html?type=demon&id=${result[1]}`)
            );

            v = true;
        }

        if (result[2] != null) {
            row.addComponents(
                new MessageButton()
                    .setLabel('Video')
                    .setStyle('LINK')
                    .setEmoji(play)
                    .setURL(result[2])
            );

            v = true;
        }

        reply.edit({ content: "Done!", embeds: result[0], components: v? [row] : [], ephemeral: false });
    }
};