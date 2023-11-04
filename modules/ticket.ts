import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChannelType,
    CommandInteraction,
    EmbedBuilder,
} from 'discord.js';
import Module from './_type';
import { randomUUID } from 'crypto';

const mod: Module = {
    name: 'tickets',
    commands: {
        close_ticket: {
            data: {
                name: '',
                description: 'Close a Ticket',
                defaultMemberPermissions: ['ManageMessages'],
            },
            async run(ctx) {
                if (
                    !ctx.channel ||
                    ctx.channel.isDMBased() ||
                    ctx.channel.parentId !== '1165323754591748356'
                )
                    return;
                ctx.channel.edit({
                    lockPermissions: true,
                    name: 'closed-' + ctx.channel.name,
                });
                ctx.reply({
                    ephemeral: true,
                    content: `Closed ticket`,
                });
            },
        },
        ticket: {
            data: {
                name: '',
                description: 'Create a new ticket',
            },
            run: createTicket,
        },
        ticket_embed: {
            data: {
                name: '',
                description: 'a',
                defaultMemberPermissions: 'Administrator',
            },
            run(ctx) {
                if (
                    !ctx.channel ||
                    ctx.channel.isDMBased() ||
                    ctx.channel.type !== ChannelType.GuildText
                )
                    return;
                ctx.reply({ ephemeral: true, content: 'Creating message...' });
                ctx.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(':ticket: Create a new ticket')
                            .setColor('Blurple'),
                    ],
                    components: [
                        new ActionRowBuilder<ButtonBuilder>().addComponents(
                            new ButtonBuilder()
                                .setCustomId('button_create_ticket')
                                .setEmoji('🎫')
                                .setLabel('Create new ticket')
                                .setStyle(ButtonStyle.Secondary)
                        ),
                    ],
                });
            },
        },
    },
    init(client) {
        client.on('interactionCreate', (data) => {
            if (
                data.guildId === '1115595132352335922' &&
                data.isButton() &&
                data.customId === 'button_create_ticket'
            )
                createTicket(data);
        });
    },
};

export default mod;

async function createTicket(ctx: ButtonInteraction | CommandInteraction) {
    if (!ctx.guild || ctx.guildId !== '1115595132352335922') return;
    let c = await ctx.guild.channels.create({
        name: 'ticket-' + randomUUID().substring(0, 7),
        parent: '1165323754591748356',
        reason: ctx.user.tag + ' created a new ticket',
    });
    await c.permissionOverwrites.edit(ctx.user, {
        ViewChannel: true,
    });
    ctx.reply({
        ephemeral: true,
        content: `Created new Ticket! <#${c.id}>`,
    });
}
