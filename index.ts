import Module from './modules/_type';
import {
    ApplicationCommandDataResolvable,
    Client,
    ClientEvents,
    CommandInteraction,
} from 'discord.js';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

(async function () {
    const token = (await readFile(join(__dirname, 'token'))).toString();

    const client = new Client({
        intents: [
            'DirectMessages',
            'MessageContent',
            'GuildMessages',
            'Guilds',
            'GuildMembers',
        ],
    });

    let ts = __filename.endsWith('.ts');

    const modules: Record<string, Module> = {};
    console.log('Importing modules...');

    let entries = await readdir(join(__dirname, 'modules'));
    const commands: Record<string, keyof typeof modules> = {};
    const registeredEvents: Array<keyof ClientEvents> = [
        'ready',
        'interactionCreate',
    ];

    let promises: Array<any | Promise<any>> = [];

    for (const f of entries) {
        if (
            (ts && f.endsWith('.ts') && !f.endsWith('d.ts')) ||
            (!ts && f.endsWith('.js'))
        ) {
            try {
                const file = join(__dirname, 'modules', f);
                let __module = (await import(file)).default as Module;
                modules[__module.name] = __module;
                if (__module.commands)
                    for (const cmd in __module.commands) {
                        __module.commands[cmd].data.name = cmd;
                        if (cmd in commands)
                            console.error(
                                'module %s tried to register command %s, but it already existed',
                                __module.name,
                                cmd
                            );
                        else commands[cmd] = __module.name;
                    }
                if (__module.init) promises.push(__module.init(client));
                console.log('registered module %s!', __module.name);
            } catch (e) {
                console.log(
                    `Failed to load module %s:\n\n%s\n\n(ur fault lol)`,
                    f,
                    e
                );
            }
        }
    }

    await Promise.allSettled(promises);

    console.log('Registering modules done...');
    console.log('Starting bot...');
    client.login(token);

    client.on('ready', (client) => {
        registerCommands();
        console.log(
            'Logged in on %s as %s',
            new Date().toLocaleString(),
            client.user.tag
        );
    });

    client.on('interactionCreate', (interaction) => {
        if (interaction.isCommand()) {
            callCommand(interaction.commandName, interaction);
            return;
        }
    });

    function callCommand(cmd: string, data: CommandInteraction) {
        if (!(cmd in commands)) return;
        const command = modules[commands[cmd]].commands?.[cmd];
        if (!command) return;
        try {
            let res = command.run(data, client) as any;
            if (typeof res?.catch == 'function')
                res.catch(
                    error.bind({
                        name: cmd,
                        m_name: commands[cmd],
                        type: 'command',
                    })
                );
        } catch (err) {
            console.error(
                'Failed to run command %s on module %s:\n\n%s',
                cmd,
                commands[cmd],
                err
            );
        }
    }

    function registerCommands() {
        let _commands: ApplicationCommandDataResolvable[] = [];
        for (const cmd in commands) {
            let command = modules[commands[cmd]].commands?.[cmd];
            if (command) _commands.push(command.data);
        }
        if (!client.application) {
            console.error('called registerCommands before ready!');
            process.exit(-1);
        }
        client.application.commands.set(_commands);
        console.log('registered commands');
    }
})().catch(console.error);

function error(err: any) {
    console.error(
        'Failed to run %s %s on module %s:\n\n%s',
        this.type,
        this.name,
        this.m_name,
        err
    );
}
