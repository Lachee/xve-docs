export class DJSPolyfill {
    constructor(client) {
        this.client     = client;
        this.rest       = new DJSRest(this);
        this.websocket  = new DJSWebsocket(this);

        this.commands = {};
        this.websocket.on('message', msg => {
            if (msg.author.bot) return;
            let parts = msg.content.split(' ');
            if (this.commands[parts]) {
                const cmd = this.commands[parts];
                cmd.callback(msg);
            }
        });
    }

    /** Register a new command */
    command(cmd, args, fn) {
        this.commands[cmd] = { 
            name:       cmd,
            types:      args,
            callback:   fn
        };
    }

    createMessage(djsMsg) {
        if (djsMsg == null) return null;
        if (djsMsg._converted) return djsMsg;     
        djsMsg._converted = true;   
        return OUtil.defineProperties(djsMsg, {
            _converted:         true,
            guild:              this.createGuild(djsMsg.guild),
            channel:            this.createChannel(djsMsg.channel),
            author:             this.createUser(djsMsg.author),
            member:             this.createMember(djsMsg.member),
            timestamp:          djsMsg.createdTimestamp,
            mentionEveryone:    djsMsg.mentions.everyone,
            mentions:           djsMsg.mentions.users.map(u => this.createUser(u)),
            mentionRoles:       djsMsg.mentions.roles.map(r => this.createRoles(r)),
            mentionChannels:    djsMsg.mentions.channels.map(c => this.createChannel(c)),
            attachments:        djsMsg.attachments.map(a => this.createAttachment(a)),
            reactions:          djsMsg.reactions.cache.map(r => this.createReaction(r)),
            type:               0, //djsMsg.type
            flags:              djsMsg.flags.bitfield,
        });
    }

    createChannel(djsChnl) {
        if (djsChnl == null) return null;
        if (djsChnl._converted) return djsChnl;
        djsChnl._converted = true;
        const typeMap = { 'text': 0, 'dm': 1, 'voice': 2, 'category': 4, 'news': 5, 'store': 6 }
        return OUtil.defineProperties(djsChnl, {
            _converted:         true,
            guild:              this.createGuild(djsChnl.guild),
            lastMessage:        this.createMessage(djsChnl.lastMessage),
            type:               typeMap[djsChnl.type],
            bitrate:            djsChnl.bitrate ?? -1,
            userLimit:          djsChnl.userLimit ?? -1,
        });
    }

    createGuild(djsGuild) {
        if (djsGuild == null) return null;
        if (djsGuild._converted) return djsGuild;
        
        djsGuild._converted = true;
        return OUtil.defineProperties(djsGuild, {
            _converted:             true,
            afkChannel:             this.createChannel(djsGuild.afkChannel),
            widgetChannel:          this.createChannel(djsGuild.widgetChannel),
            roles:                  djsGuild.roles.cache.map(r => this.createRole(r)),
            emojis:                 djsGuild.emojis.cache.map(e => this.createEmoji(e)),
            systemChannel:          this.createChannel(djsGuild.systemChannel),
            rulesChannel:           this.createChannel(djsGuild.rulesChannel),
            members:                djsGuild.members.cache.map(m => this.createMember(m)),
            channels:               djsGuild.channels.cache.map(c => this.createChannel(c)),
            publicUpdatesChannel:   this.createChannel(djsGuild.publicUpdatesChannel),
        });
    }

    createUser(djsUser) {
        return djsUser;
    }

    createMember(djsMember) {
        return djsMember;
    }

    createRole(djsRole) {
        return djsRole;
    }

    createAttachment(djsAttachment) {
        return djsAttachment;
    }

    createEmbed(djsEmbed) {
        return djsEmbed;
    }

    createReaction(djsReaction) {
        return djsReaction;
    }

    createEmoji(djsEmoji) {
        return djsEmoji;
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
                this.client.on('message', (message) => callback(this.base.createMessage(message)));
                break;
            case 'messageUpdate':
                this.client.on('messageUpdate', (oldMessage, newMessage) => callback(this.base.createMessage(oldMessage), this.base.createMessage(newMessage)));
                break;
            case 'messageDelete':
                this.client.on('messageDelete', (message) => callback(this.base.createMessage(message)));
                break;
            case 'messageDeleteBulk':
                this.client.on('messageDeleteBulk', (messages) => callback(messages.map(m => this.base.createMessage(m))));
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

class OUtil {
    static defineProperties(obj, properties) {
        let clone = Object.assign({}, obj);
        for(let k in properties) {
            Object.defineProperty(clone, k, {
                value: properties[k],
                writable: true,
                enumerable: true,
                configurable: true,
            })
        }

        return clone;
    }
}