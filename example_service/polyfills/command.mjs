export class CommandHandler {
    constructor(client, options = {} ) {
        this.client = client;
        
        this.caseSensitive = options.caseSensitive ?? true;
        this._commands = {};
        this._converters = {};
        
        this.client.websocket.on('message', async (msg) => {
            if (msg.author.bot) return;

            let parts = msg.content.split(' ');
            let cmd = parts[0]; 
            if (!this.caseSensitive) cmd = cmd.toLowerCase();

            //Check if the command exists
            if (this._commands[cmd]) {

                //Find all the overloads
                for(let argjoin in this._commands[cmd]) {

                    //Make sure the argument counts match
                    const command = this._commands[cmd][argjoin];
                    if (command.arguments.length == parts.length - 1) {

                        //Try and convert each argument
                        let success = true;
                        let args    = [ msg ];
                        for (let i = 1; i < parts.length; i++) {
                            try {
                                const argType = command.arguments[i-1];
                                const converted = await this.convert(parts[i], argType, msg);
                                args.push(converted);
                            } catch(e) {
                                //We failed to convert, so lets break out of this loop early and set hte fail flag
                                success = false;
                                break;
                            }
                        }

                        //If we converted successfully, then run the callback and return from this function
                        if (success && args.length == parts.length) {
                            console.log('Command Handler: Executing ', command);
                            command.callback(...args);
                            return;
                        }
                    }
                    
                }
            }
        });

        //Finally register the default types
        this.registerDefaultConverters();
    }

    async convert(text, type, context = null) {
        if (!this._converters[type])
            throw new Exception('Converter does not exist for the type');

        return await this._converters[type].convert(text, context);
    }

    /** Registers a command handler */
    register(command, argumentTypes, callback) {
        const argjoin   = argumentTypes.join(',');
        const cmd       = this.caseSensitive ? command.toLowerCase() : command;

        if (this._commands[cmd] == null) 
            this._commands[cmd] = {};

        this._commands[cmd][argjoin] = { command, callback, arguments: argumentTypes};
        console.log('Command Handler: Registering ', cmd, argjoin, this._commands[cmd][argjoin]);
    }

    /** Registers a type converter */
    registerConverter(type, converter) {
        console.log('Command Handler: Types ', type);
        this._converters[type] = converter;
    }

    /** Registers the default type converters */
    registerDefaultConverters() {
        this.registerConverter('string', new ArgumentConverter(this.client));
        this.registerConverter('boolean', new BooleanConverter(this.client));
        this.registerConverter('integer', new NumberConverter(this.client, { isInteger: true }));
        this.registerConverter('number', new NumberConverter(this.client, { isInteger: false }));
        this.registerConverter('member', new UserConverter(this.client, { isMember: true }));
        this.registerConverter('user', new UserConverter(this.client, { isMember: false }));
    }
}


export class ArgumentConverter {
    constructor(client, options = {}) { this.client = client; }
    
    /**
     * Converts the text into the appropriate data type.
     * Throws an exception if it was unable to convert.
     * @param {String} text the argument as a string
     * @param context the optional message context
     */
    async convert(text, context = null) {
        return text;
    }
}

class BooleanConverter extends ArgumentConverter {
    constructor(client, options) {
        super(client, options);
    }

    async convert(text, context = null) {
        const lwr = text.toLowerCase();
        if (lwr == 'true' || lwr == 'yes') return true;
        if (lwr == 'false' || lwr == 'no') return false;
        throw new Exception('Value is not a valid boolean');
    }
}

class NumberConverter extends ArgumentConverter {
    constructor(client, options) {
        super(client, options);
        this.isInteger = options.isInteger ?? false;
    }

    async convert(text, context = null) {
        if (this.isInteger) {
            const int = parseInt(text);
            if (int.toString() !== text || !Number.isInteger(int))
                throw new Exception('Value is not a valid integer');
            return int;
        } else {
            const flt = parseFloat(text);
            if (flt.toString() !== text)
                throw new Exception('Value is not a valid number');
            return flt;
        }
    }
}

class UserConverter extends ArgumentConverter {
    constructor(client, options) { 
        super(client, options); 
        this.isMember = options.isMember ?? false;
    }

    async convert(text, context = null) {
        let snowflake = null;

        //Test if its a really long number.
        const snowflakeMatches = text.match(/^\d{17,}$/);
        if (snowflakeMatches && snowflakeMatches.length)
            snowflake = text;

        //We havn't got a snowflake, so lets try getting it from a mention
        if (snowflake == null) {
            const matches = text.match(/^<@!?(\d+)>$/);
            if (matches && matches.length == 2) snowflake = matches[1];
        }

        //We still havn't got a snowflake, error.
        if (snowflake == null) throw new Exception('Value is not a valid snowflake');
        
        //Find the member
        if (this.isMember) { 
            if (context == null)                 
                throw new Exception('No context given');
                
            const member = context.guild.members.find(m => m.id == snowflake);
            if (member != null) return member;
            
            throw new Exception('Value is not a valid member');
        } else {

            //Find the user
            const user = await this.client.rest.getUser(snowflake);
            if (user != null) return user;

            //Error out
            throw new Exception('Value is not a valid user');
        }
    }
}