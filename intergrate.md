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

## Custom Nodes

XVE is in a very early state and does not have the framework yet to support every individual providers needs. In saying that however, with the introduction to monetization schemes, XVE will allow for integrators to define not only what nodes are available for their users, but also custom nodes.

Currently, the custom node generation is pretty bare bones, and requires Lachee to directly add it. But in the future a flexible system will be provided.