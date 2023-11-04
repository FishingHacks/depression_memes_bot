"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mod = {
    name: 'reddit',
    commands: {
        reddit: {
            data: {
                name: 'reddit',
                description: 'Gives you the url to the subreddit',
            },
            run(ctx, _) {
                ctx.reply({
                    ephemeral: true,
                    content: '[r/depression_memes](https://reddit.com/depression_memes)',
                });
            },
        },
    },
};
exports.default = mod;
