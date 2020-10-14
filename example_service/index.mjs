import dotenv from 'dotenv'; dotenv.config();
import { DJSPolyfill } from '../polyfill/discordjs.mjs';
import { generate } from 'astring';
import fetch  from 'node-fetch';
import fs from 'fs/promises';
import Discord from 'discord.js';

console.log("test");
let discord = null;
let client = null;

async function runUrl(url) {
    const response = await fetch(url);
    const json = await response.json();
    if (json.status != 200) {
        console.error('failed to load ast, bad status code', json);
        return;
    }

    if (json['data']['sourceType'] != 'module' || !json['data']['body'].length) {
        console.error('missing AST', json);
        return;
    }

    return await run(json['data']);
}

async function runFile(file) {
    const data = await fs.readFile(file);
    const ast = JSON.parse(data);
    return await run(ast);
}

async function run(ast) {

    //Prepare discord
    discord = new Discord.Client();
    discord.on('ready', () => { 
        console.log('Bot Ready. Evaluating code...');
        
        //Evaluate the code    
        const code = generate(ast);
        console.log("Evaluating code", code);
        eval(code);
        console.log("Evaluated");
    });
    discord.on('message', (msg) => {
        /** tmp disable */
        if (msg.content !== "!stop") return;
        console.log(msg.content);
        discord.destroy();
        discord = null;
        client = null;
    });

    //Prepare the client55
    client = new DJSPolyfill(discord);
    return await discord.login(process.env.TOKEN);
}


runFile('example.json').then(() => {
    console.log('terminated');
});
