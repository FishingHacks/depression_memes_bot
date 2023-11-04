"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const crypto_1 = require("crypto");
const mod = {
    name: 'tickets',
    commands: {
        close_ticket: {
            data: {
                name: '',
                description: 'Close a Ticket',
                defaultMemberPermissions: ['ManageMessages'],
            },
            run(ctx) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (!ctx.channel ||
                        ctx.channel.isDMBased() ||
                        ctx.channel.parentId !== '1165323754591748356')
                        return;
                    ctx.channel.edit({
                        lockPermissions: true,
                        name: 'closed-' + ctx.channel.name,
                    });
                    ctx.reply({
                        ephemeral: true,
                        content: `Closed ticket`,
                    });
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
                if (!ctx.channel ||
                    ctx.channel.isDMBased() ||
                    ctx.channel.type !== discord_js_1.ChannelType.GuildText)
                    return;
                ctx.reply({ ephemeral: true, content: 'Creating message...' });
                ctx.channel.send({
                    embeds: [
                        new discord_js_1.EmbedBuilder()
                            .setTitle(':ticket: Create a new ticket')
                            .setColor('Blurple'),
                    ],
                    components: [
                        new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                            .setCustomId('button_create_ticket')
                            .setEmoji('🎫')
                            .setLabel('Create new ticket')
                            .setStyle(discord_js_1.ButtonStyle.Secondary)),
                    ],
                });
            },
        },
    },
    init(client) {
        client.on('interactionCreate', (data) => {
            if (data.guildId === '1115595132352335922' &&
                data.isButton() &&
                data.customId === 'button_create_ticket')
                createTicket(data);
        });
    },
};
exports.default = mod;
function createTicket(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!ctx.guild || ctx.guildId !== '1115595132352335922')
            return;
        let c = yield ctx.guild.channels.create({
            name: 'ticket-' + (0, crypto_1.randomUUID)().substring(0, 7),
            parent: '1165323754591748356',
            reason: ctx.user.tag + ' created a new ticket',
        });
        yield c.permissionOverwrites.edit(ctx.user, {
            ViewChannel: true,
        });
        ctx.reply({
            ephemeral: true,
            content: `Created new Ticket! <#${c.id}>`,
        });
    });
}
