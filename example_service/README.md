# Example Service
This application is an example consumer of an XVE webhook.

## Run

This project requires `node.js > 14` as it uses ES6 modules. To run, simply run
`node index.mjs`

But dont forget to copy the `.env-sample` and change its values. The JWT_PATH is the path to the file that contains the JWT public key, [provided by XVE](https://xve.lachee.dev/jwt).