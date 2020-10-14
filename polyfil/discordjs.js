export class DJSPolyfill {
    constructor(client) {
        this.client     = client;
        this.rest       = new DJSRest(this);
        this.websocket  = new DJSWebsocket(this);
    }

    createMessage(djsMsg) {
        return Object.assign(djsMsg, {
            timestamp:          djsMsg.createdTimestamp,
            mentionEveryone:    djsMsg.mentions.everyone,
            mentions:           djsMsg.mentions.users.array(),
            mentionRoles:       djsMsg.mentions.roles.array(),
            mentionChannels:    djsMsg.mentions.channels.array(),
            attachments:        djsMsg.attachments.array(),
            reactions:          djsMsg.reactions.cache.array(),
            type:               0, //djsMsg.type
            flags:              djsMsg.flags.bitfield,
        });
    }
}

export class DJSRest {
    /** @type {DJSPolyfill} base */
    base = null;
    
    constructor(base) {
        this.base   = base;
        this.client = base.client;
    }

    async createMessage(channel, contents, embed) {
        if (typeof  channel === 'string') 
            channel = await this.client.channels.fetch(channel);
        
        //Finally, execute the callback
        const msg = await channel.send(contents,  { embed });
        return this.client.createMessage(msg);
    }

    async editMessage(message, contents, embed) {
        const msg = await message.edit(contents, embed);
        return this.client.createMessage(msg);
    }

    async deleteMessage(message) {
        await message.delete();
    }
}

export class DJSWebsocket {
    /** @type {DJSPolyfill} base */
    base = null;

    constructor(base) {
        this.base   = base;
        this.client = base.client;
    }

    /** Subscribes to an event */
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
}