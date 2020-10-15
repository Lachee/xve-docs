import dotenv from 'dotenv'; dotenv.config();
import { DJSPolyfill } from './polyfills/discordjs.mjs';
import { generate } from 'astring';
import fetch  from 'node-fetch';
import fs from 'fs/promises';
import http from 'http';
import Discord from 'discord.js';
import { JWT, JWK } from 'jose';
import crypto from 'crypto';

console.log("XVE Example Bot Service");
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

    if (discord != null) {
        console.log('Destroying discord client for new ast...');
        discord.destroy();
        discord = null;
        client = null;
    }

    //Prepare discord
    console.log('Creating discord client');
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

// Run the default instance
// runFile('example.json').then(() => {
//     console.log('terminated');
// });


//Create a webserver and listen to that
http.createServer(async (request, response) => {
    
    //Validate the method
    if (request.method !== 'POST') {
        response.writeHead(405);
        response.end('Posts only');
        return;
    }

    //Make sure we have a webhook header
    const token = request.headers['x-xve-webhook'];
    if (token == null || token == '') { 
        console.log('bad request, missing jwt');
        response.writeHead(403);
        response.end('Missing JWT');
        return;
    }
    
    try {
        //Validate the webhook
        const publicKey = await fs.readFile(process.env.JWT_PATH || 'jwt.pub');
        const key = JWK.asKey(publicKey);
        const jwt = JWT.verify(token, key);

        //Get the body and validate it
        let body = '';
        request.on('data', chunk => {body += chunk.toString(); });
        request.on('end', () => {
            
            //Verify the checksums
            const md5 = crypto.createHash('md5').update(body).digest('hex');
            const sha1 = crypto.createHash('sha1').update(body).digest('hex');
            if (md5 !== jwt.md5 || sha1 !== jwt.sha) {
                console.log('bad request, invalid sums');
                response.writeHead(403);
                response.end('Bad check sums, payload interfered with. This incident maybe reported.');
                return;
            }

            //Now that we verified everything is the same still, deploy
            const webhook = JSON.parse(body);
            run(webhook.ast);

            //Tell them we deployed
            response.writeHead(200);
            response.end('Deployed', null, 2);
        });
        
    } catch(e) {
        console.log('bad request, error', e);
        response.writeHead(403);
        response.end(JSON.stringify(e));
    }
}).listen(process.env.PORT || 3000);