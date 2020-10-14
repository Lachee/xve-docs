export class DJSPolyfill {
    constructor(client) {
        this.client     = client;
        this.rest       = new DJSRest(this);
        this.websocket  = new DJSWebsocket(this);
    }

    createMessage(djs_message) {
        return Object.assign(djs_message, {
            
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
        
        //Send the message
        let msg = null;
        if (embed != undefined) {
            msg = await channel.send(contents, { embed });
        } else {
            msg = await channel.send(contents);
        }

        //Finally, execute the callback
        return this.client.createMessage(msg);
    }

    editMessage(message, contents, embed, callback) {
        if (typeof message === 'string')
            
    }

    deleteMessage(message) {

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