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

    for (const f of entries) {
        if (
            (ts && f.endsWith('.ts') && !f.endsWith('d.ts')) ||
            (!ts && f.endsWith('.js'))
        ) {
            try {
                const file = join(__dirname, 'modules', f);
                let module = (await import(file)).default as Module;
                modules[module.name] = module;
                if (module.commands)
                    for (const cmd in module.commands) {
                        module.commands[cmd].data.name = cmd;
                        if (cmd in commands)
                            console.error(
                                'module %s tried to register command %s, but it already existed',
                                module.name,
                                cmd
                            );
                        else commands[cmd] = module.name;
                    }
                if (module.events)
                    for (const _ev in module.events) {
                        let ev = _ev as keyof ClientEvents;
                        if (!registeredEvents.includes(ev)) {
                            registeredEvents.push(ev);
                            client.on(ev, callEvent.bind(globalThis, ev));
                        }
                    }
                console.log('registered module %s!', module.name);
            } catch (e) {
                console.log(
                    `Failed to load module %s:\n\n%s\n\n(ur fault lol)`,
                    f,
                    e
                );
            }
        }
    }

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

        callEvent('ready', client);
    });

    client.on('interactionCreate', (interaction) => {
        if (interaction.isCommand()) {
            callCommand(interaction.commandName, interaction);
            return;
        }
        callEvent('interactionCreate', interaction);
    });

    function callEvent<K extends keyof ClientEvents>(
        ev: K,
        ...args: ClientEvents[K]
    ) {
        for (const name in modules) {
            const m = modules[name];
            if (m.events)
                for (const e in m.events)
                    if (e == ev) {
                        try {
                            let res = m.events[e](client, ...args);
                            if (typeof res?.catch == 'function')
                                res.catch(
                                    error.bind({
                                        name: ev,
                                        m_name: m.name,
                                        type: 'event',
                                    })
                                );
                        } catch (err) {
                            console.error(
                                'Failed to run event %s on module %s:\n\n%s',
                                ev,
                                m.name,
                                err
                            );
                        }
                    }
        }
    }

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
        console.log('registered commands')
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
