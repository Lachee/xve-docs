# XVE Polyfils
XVE needs polyfils to work with your specific library.
It is based around the discord.js library, but has been abstracted away so it doesn't rely on any particular library and can be easily polyfilled to fit your sdk.

## Events
Events are as written in the Discord documentation, except for the following rules:
* IDs are expected to be objects instead
* Parameter ordering is the same as documented, except its heirachical:
    * `guild_id, message_id, channel_id` would become `(GuildObject, ChannelObject, MessageObject)` in the callback.
* Updates generally have a Before and After. You may need some caching to support this feature!

## Functions
Expected functions and their parameters:

| Function | Parameters | D.JS Equiv |
|----------|------------|------------|
| sendMessage | Channel / Snowflake, String | channel.send(string) |


## Examples

[Discord.JS](./discordjs.js)