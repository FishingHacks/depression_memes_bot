import type {
    ClientEvents,
    ApplicationCommandData,
    Client,
    CommandInteraction,
    Awaitable,
} from 'discord.js';

export default interface Module {
    name: string;

    commands?: Record<string, Command>;
    events?: Record<keyof ClientEvents, (client: Client, ...args: ClientEvents[keyof ClientEvents]) => Awaitable<any>>;
}

export interface Command {
    data: ApplicationCommandData;
    run(ctx: CommandInteraction, client: Client): Awaitable<void>;
}
