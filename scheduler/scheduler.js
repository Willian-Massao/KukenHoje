const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const {
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    ComponentType,
    EmbedBuilder
} = require('discord.js');

require('dotenv').config();

const streakPath = path.join(__dirname, '../streak.json');

function loadStreak() {
    try {
        return JSON.parse(fs.readFileSync(streakPath, 'utf-8'));
    } catch {
        return { days: 0 };
    }
}

function saveStreak(data) {
    fs.writeFileSync(streakPath, JSON.stringify(data, null, 2));
}

function startDailyReminder(client, channelId) {
    cron.schedule('0 0 * * *', async () => {
        const channel = await client.channels.fetch(channelId);
        if (!channel) return;

        const confirm = new ButtonBuilder()
            .setCustomId('confirm')
            .setLabel('Sim')
            .setStyle(ButtonStyle.Success);

        const cancel = new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('Não')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder().addComponents(cancel, confirm);

        const message = await channel.send({
            content: `Hoje teve Live Code do Kuken?`,
            components: [row],
        });

        try {
            const confirmation = await message.awaitMessageComponent({
                componentType: ComponentType.Button,
                time: 60_000
            });

            const streak = loadStreak();

            if (confirmation.customId === 'confirm') {
                streak.days += 1;
                saveStreak(streak);

                await confirmation.update({
                    content: `<@${process.env.NATAN_ID}> está há ${streak.days} dia(s) fazendo Live Code do Kuken! 🔥`,
                    components: [],
                });
            } else if (confirmation.customId === 'cancel') {
                streak.days = 0;
                saveStreak(streak);

                await confirmation.update({
                    content: `<@${process.env.NATAN_ID}> perdeu o streak de Live Code do Kuken 😢`,
                    components: [],
                });
            }
        } catch {
            const streak = loadStreak();
            streak.days += 1;
            saveStreak(streak);

            await message.edit({
                content: `⏰ Tempo esgotado. Considerando que <@${process.env.NATAN_ID}> está há ${streak.days} dia(s) fazendo Live Code do Kuken! 🔥`,
                components: [],
            });
        }
    }, {
        timezone: 'America/Sao_Paulo'
    });
}

module.exports = { startDailyReminder };
