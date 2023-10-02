import Module from './_type';

const module: Module = {
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
                    content:
                        '[r/depression_memes](https://reddit.com/depression_memes)',
                });
            },
        },
    },
};

export default module;
