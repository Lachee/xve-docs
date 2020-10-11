export class DiscordJsPolyfill {
    constructor(client) {
        this.client = client;
    }

    on(event, callback) {
        switch(event) {
            default:
                throw new Error('Invalid Event: ' + event);
                break;

            case 'message':
                this.client.on('message', (message) => callback(message));
                break;
            case 'messageUpdate':
                this.client.on('messageUpdate', (oldMessage, newMessage) => callback(oldMessage, newMessage));
                break;
            case 'messageDelete':
                this.client.on('messageDelete', (message) => callback(message));
                break;
            case 'messageDeleteBulk':
                this.client.on('messageDeleteBulk', (messages) => callback(messages));
                break;
            

            case 'messageReactionAdd':
                this.client.on('messageReactionAdd', (reaction, user) => callback(user, reaction.message.guild, reaction.message.channel, reaction.message, reaction.emoji));
                break;
            case 'messageReactionRemove':
                this.client.on('messageReactionRemove', (reaction, user) => callback(user,  reaction.message.guild, reaction.message.channel, reaction.message, reaction.emoji));
                break;
            case 'messageReactionRemoveAll':
                this.client.on('messageReactionRemoveAll', (message) => callback(message.guild, message.channel, message));
                break;
            case 'messageReactionRemoveEmoji':
                this.client.on('messageReactionRemoveEmoji', (reaction) => callback(reaction.message.guild, reaction.message.channel, reaction.message, reaction.emoji));
                break;

        }
    }

    sendMessage(channel, contents, embed, callback) {
        if (typeof channel === 'string') {
            this.client.channels.fetch(channel).then(channel => { 
                channel.send(contents).then(msg => callback(msg));
            });
        } else {
            channel.send(contents).then(msg => callback(msg));
        }
    }

    editMessage(message, contents, embed, callback) {        
    }
}