# Example Service
Using this service, you can run a Discord.JS bot with the XVE project automatically with Webhooks.

This is a sample consumer of a XVE webhook. Using Node.js 14, it will create a lightweight webserver that listens for POST requests to it with the bot's AST.
It shows how to validate the JWT header to ensure the origins of the POST, and how to then compile the AST and run it with a Discord.JS [polyfill](https://lachee.github.io/xve-docs/polyfill/polyfill.html).

## Run

**This project requires Node 14 or above**

1. `npm i` to get hte packages
2. Copy the `.env-sample` to `.env` and update its values to match your setup
3. Download the Public Key from [xve.lachee.dev/jwt](https://xve.lachee.dev/jwt) and save that in the file listed in the `.env`
4. Run the project with `node .`
5. **In XVE**, update the webhook to match your _public_ IP address and forwarded port (This is an external request coming into your machine all the way from Sydney*, so be sure you forward appropriate ports) (_figure A._).
6. Deploy the webhook with the `cloud -> deploy` or `f6` in XVE. Your bot will automatically run.

*note: probably

### Figure A. Project Settings
![Project Settings](https://i.lu.je/2020/chrome_vxI27zgBPK.png)

### Figure B. Deploy Webhook
![Deploy Webhook](https://i.lu.je/2020/chrome_tANEdacQfX.png)

## Important Files
Here is a list of files that are important if you just want to see how it works:

* `index.mjs` handles webhooks
* `polyfills/discordjs.mjs` handles discord.js integration
* `polyfills/command.mjs` handles command execution