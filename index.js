"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const promises_1 = require("fs/promises");
const path_1 = require("path");
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const token = (yield (0, promises_1.readFile)((0, path_1.join)(__dirname, 'token'))).toString();
        const client = new discord_js_1.Client({
            intents: [
                'DirectMessages',
                'MessageContent',
                'GuildMessages',
                'Guilds',
                'GuildMembers',
            ],
        });
        let ts = __filename.endsWith('.ts');
        const modules = {};
        console.log('Importing modules...');
        let entries = yield (0, promises_1.readdir)((0, path_1.join)(__dirname, 'modules'));
        const commands = {};
        const registeredEvents = [
            'ready',
            'interactionCreate',
        ];
        let promises = [];
        for (const f of entries) {
            if ((ts && f.endsWith('.ts') && !f.endsWith('d.ts')) ||
                (!ts && f.endsWith('.js'))) {
                try {
                    const file = (0, path_1.join)(__dirname, 'modules', f);
                    let __module = (yield (_a = file, Promise.resolve().then(() => __importStar(require(_a))))).default;
                    modules[__module.name] = __module;
                    if (__module.commands)
                        for (const cmd in __module.commands) {
                            __module.commands[cmd].data.name = cmd;
                            if (cmd in commands)
                                console.error('module %s tried to register command %s, but it already existed', __module.name, cmd);
                            else
                                commands[cmd] = __module.name;
                        }
                    if (__module.init)
                        promises.push(__module.init(client));
                    console.log('registered module %s!', __module.name);
                }
                catch (e) {
                    console.log(`Failed to load module %s:\n\n%s\n\n(ur fault lol)`, f, e);
                }
            }
        }
        yield Promise.allSettled(promises);
        console.log('Registering modules done...');
        console.log('Starting bot...');
        client.login(token);
        client.on('ready', (client) => {
            registerCommands();
            console.log('Logged in on %s as %s', new Date().toLocaleString(), client.user.tag);
        });
        client.on('interactionCreate', (interaction) => {
            if (interaction.isCommand()) {
                callCommand(interaction.commandName, interaction);
                return;
            }
        });
        function callCommand(cmd, data) {
            var _a;
            if (!(cmd in commands))
                return;
            const command = (_a = modules[commands[cmd]].commands) === null || _a === void 0 ? void 0 : _a[cmd];
            if (!command)
                return;
            try {
                let res = command.run(data, client);
                if (typeof (res === null || res === void 0 ? void 0 : res.catch) == 'function')
                    res.catch(error.bind({
                        name: cmd,
                        m_name: commands[cmd],
                        type: 'command',
                    }));
            }
            catch (err) {
                console.error('Failed to run command %s on module %s:\n\n%s', cmd, commands[cmd], err);
            }
        }
        function registerCommands() {
            var _a;
            let _commands = [];
            for (const cmd in commands) {
                let command = (_a = modules[commands[cmd]].commands) === null || _a === void 0 ? void 0 : _a[cmd];
                if (command)
                    _commands.push(command.data);
            }
            if (!client.application) {
                console.error('called registerCommands before ready!');
                process.exit(-1);
            }
            client.application.commands.set(_commands);
            console.log('registered commands');
        }
    });
})().catch(console.error);
function error(err) {
    console.error('Failed to run %s %s on module %s:\n\n%s', this.type, this.name, this.m_name, err);
}
