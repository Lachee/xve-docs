import Discord from 'discord.js';
const { MessageEmbed } = Discord;

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
        if (djsEmbed instanceof DJSEmbedBuilder) return djsEmbed;
        return new DJSEmbedBuilder(djsEmbed);
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
        const builtEmbed = embed ? embed.build() : null;
        const msg = await channel.send(contents,  { embed: builtEmbed });
        const resp = this.base.createMessage(msg);
        return resp;
    }

    async editMessage(message, contents, embed) {
        const builtEmbed = embed ? embed.build() : null;
        const msg = await message.edit(contents,  { embed: builtEmbed });
        return this.base.createMessage(msg);
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

/** Custom embed builder to be compatiable with XVE */
export class DJSEmbedBuilder {
    constructor(djsembed) {
        if (djsembed != null) {
            this.title          = djsembed.title ?? null;
            this.description    = djsembed.description ?? null;
            this.url            = djsembed.url ?? null;
            this.color          = djsembed.hxColor ?? null;        
            this.footer         = djsembed.footer ? { text: djsembed.footer.text, iconUrl: djsembed.footer.iconUrl } : null;
            this.author         = djsembed.author ? { name: djsembed.author.name, iconUrl: djsembed.author.iconUrl, url: djsembed.author.url } : null;
            this.thumbnail      = djsembed.thumbnail ?? null;
            this.image          = djsembed.image ?? null;        
            this.fields         = djsembed.fields ?? [];
        } else {
            this.title          = null;
            this.description    = null;
            this.url            = null;
            this.color          = null;
            this.footer         = null;
            this.author         = null;
            this.thumbnail      = null;
            this.image          = null;
            this.fields         = null;
            this.fields = [];
        }
    }

    setTitle(str) { this.title = str; return this; }
    setDescription(str) { this.description = str; return this; }
    setUrl(str) { this.url = str; return this; }
    setColor(color) { this.color = color; return this; }
    setFooter(text, url) { 
        if (this.footer == null) this.footer = { text: null, iconUrl: null };
        if (text != null)   this.footer.text = text;
        if (url != null)    this.footer.iconUrl = url;
        return this;
    }
    setThumbnail(str) { this.thumbnail = str; return this; }
    setImage(str) { this.image = str; return this; }
    setAuthor(name, iconUrl, url) {
        if (this.author == null) this.author = { name: null, iconUrl: null, url: null };
        if (name != null)       this.author.name = name;
        if (iconUrl != null)    this.author.iconUrl = iconUrl;
        if (url != null)        this.author.url = url;
        return this;
    }
    addField(title, value, inline) {
        this.fields.push({
            title: title,
            value: value,
            inline: inline != null ? inline : false
        });
        return this;
    }

    build() {
        const embed = new MessageEmbed();
        if (this.title)         embed.setTitle(this.title);
        if (this.description)   embed.setDescription(this.description);
        if (this.url)           embed.setURL(this.url);
        if (this.color)         embed.setColor(this.color);
        if (this.footer)        embed.setFooter(this.footer.text, this.footer.iconUrl);
        if (this.thumbnail)     embed.setThumbnail(this.thumbnail);
        if (this.image)         embed.setImage(this.image);
        if (this.author)        embed.setAuthor(this.author.name, this.author.iconUrl, this.author.url);
        if (this.fields) {
            for(let i in this.fields) {
                embed.addField(this.fields[i].name, this.fields[i].value, this.fields[i].inline);
            }
        }
        return embed;
    }

}

/** Utility functions */
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