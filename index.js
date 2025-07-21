const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { status } = require('minecraft-server-util');

const DISCORD_TOKEN = 'YOUR_DISCORD_BOT_TOKEN';
const CHANNEL_ID = 'YOUR_CHANNEL_ID';
const MC_SERVER_HOST = 'your.minecraft.server';
const MC_SERVER_PORT = 25565; // Default Java port

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

let lastMessageId = null;

async function fetchServerStatus() {
    try {
        const result = await status(MC_SERVER_HOST, MC_SERVER_PORT);
        return {
            online: true,
            players: result.players.online,
            maxPlayers: result.players.max,
        };
    } catch (e) {
        return {
            online: false,
            players: 0,
            maxPlayers: 0,
        };
    }
}

async function postStatus(channel) {
    const server = await fetchServerStatus();
    const embed = new EmbedBuilder()
        .setTitle('Minecraft Server Status')
        .setDescription(server.online ? '🟢 **Online**' : '🔴 **Offline**')
        .addFields(
            { name: 'Players', value: `${server.players}/${server.maxPlayers}`, inline: true }
        )
        .setFooter({ text: 'Updated every 10 seconds' })
        .setTimestamp();

    // Delete the last status message for cleanliness
    if (lastMessageId) {
        try {
            const lastMsg = await channel.messages.fetch(lastMessageId);
            if (lastMsg) await lastMsg.delete();
        } catch (e) { /* ignore errors */ }
    }

    // Post new status message
    const sent = await channel.send({ embeds: [embed] });
    lastMessageId = sent.id;
}

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    const channel = await client.channels.fetch(CHANNEL_ID);

    setInterval(() => postStatus(channel), 10 * 1000);
});

client.login(DISCORD_TOKEN);