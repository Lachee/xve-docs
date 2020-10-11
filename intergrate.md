## Integration

Welcome to XVE! I hope you have been enjoying the editor and the tools it provides.
This page is to talk about **integration with hosting providers**, and the process involved in getting integrated with XVE.

XVE has an API that will allow for hosting providers to automatically link, download and run bots that are created using XVE. 

## API

The API is yet to be written. 
There are plans to have a variety of hooks, from getting user's bots and projects, monetization schemes, publish webhooks and more.
For now, there is only 1 important endpoint:

`/api/project/{project_id}/ast`

This endpoint will generate the Abstract Syntax Tree for a project. This AST is ESTree compliant and it is up to you as the integrator to fetch this tree and compile it with your own tooling. 
For the example code previewed in XVE, I use a tool called [astring]() to compile to js.

## Polyfill

XVE works fairly bare bones. In order to appeal to as many potential hosts, it tries to keep true to the Discord API source. As a result, the generated AST is expected to be passed Polyfilled objects to link your SDK with XVE's.

For more information on polyfilling, and a Discord.js example polyfill, please read the [Polyfill](./polyfil/polyfil.md) documentation.

## Webhooks

During the initial prototype, projects can be assigned webhooks.
These webhooks are called with a HTTP POST request and its payload looks like thus:
```
{
    "id": 42,
    "event": "event:project:deploy",
    "ast": { /** ... spooky ESTree  ... */ }
}
```

The webhook will also give a special header: `X-XVE-Webhook`.
This header is a [JWT](https://jwt.io/), and contains the MD5 and SHA1 hash of the JSON payload. It is important you verify the checksum of what you got against the JWT, and then verify the JWT was actually created by XVE with the [Public Key](https://xve.lu.je/jwt). This will ensure that no man-in-the-middle gave you a dodgy AST.

**Remember, this is glorified remote code execution!**

## Custom Nodes

XVE is in a very early state and does not have the framework yet to support every individual providers needs. In saying that however, with the introduction to monetization schemes, XVE will allow for integrators to define not only what nodes are available for their users, but also custom nodes.

Currently, the custom node generation is pretty bare bones, and requires Lachee to directly add it. But in the future a flexible system will be provided.