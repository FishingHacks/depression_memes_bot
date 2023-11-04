import type {
    ApplicationCommandData,
    Client,
    CommandInteraction,
    Awaitable,
} from 'discord.js';

export default interface Module {
    name: string;

    commands?: Record<string, Command>;
    init?: (client: Client) => Promise<void> | void;
}

export interface Command {
    data: ApplicationCommandData;
    run(ctx: CommandInteraction, client: Client): Awaitable<void>;
}
