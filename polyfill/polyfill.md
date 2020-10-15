# Polyfill
XVE needs polyfills to work with your specific library.
It is based around the discord.js library, but has been abstracted away so it doesn't rely on any particular library and can be easily polyfilled to fit your sdk.

## Events
Events are as written in the Discord documentation, except for the following rules:
* IDs are expected to be objects instead
* Parameter ordering is the same as documented, except its hierarchical:
    * `guild_id, message_id, channel_id` would become `(GuildObject, ChannelObject, MessageObject)` in the callback.
* Updates generally have a Before and After. You may need some caching to support this feature!

## Async
Async is not supported. The `then` callback is used for everything.
Instead of `await channel.send()` its, `channel.send().then(callback);`

## Functions
Expected functions and their parameters:

| Function | Parameters | D.JS Equiv |
|----------|------------|------------|
| sendMessage | Channel / Snowflake, String | channel.send(string) |

TODO: Implement more of these

## Objects
Objects passed to graphs are expected to match the Discord API's responses. There are some rules to govern how objects should look and behave:
* lowerPascalCase names instead of snake_case.
* Snowflakes are expected to be converted to their respective object (minus id). For example, `guild_id` should be a `guild` that returns a guild object.
* No promises. These are not supported.

## Examples

[Discord.JS](../example_service/polyfills/discordjs.mjs)