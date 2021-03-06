# Astro Template Fetcher

This is a standalone npm package to fetch the template from s3 depending upon the parameters provided.

Steps to use

1. Include this package in startup boot or app.js and invoke build method, passing configuration:

- region (required)

-  folderName (required)

- accessKeyId (optional)

- secretAccessKey (optional)

1. Where ever you need to get the template, please use these methods,
- raw(params) : if you need to fetch the raw template without any modification or data injection
- interpolate(params, data) : if you need to inject the data into template, pass it in this function

  *params*: stores the information related to the template which needs to be fetched
    - entity: what entity a template belongs to, eg: partner
    - entityId: the unique identifier of entity, eg: partnerCode/partnerId of partner 
    - category: what kind of template you want, email, sms or any other
    - type: what kind of template, registration, verification or any other 
    - language: template language

  *data*: contains the information which needs to be replaced
  
  Example:
  ```
  const TemplateFetcher = require('@astro-my/template-fetcher');
  
  TemplateFetcher.build({
    region: process.env.region,
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey
  });
  
  // to fetch raw template
  const template = await TemplateFetcher.raw({
    entity: 'partner',
    entityId: 'partnerCode',
    language: 'fr',
    category: 'email',
    type: 'verification'
  });
  
  // to fetch interpolated template
  const template = await TemplateFetcher.interpolate({
    entity: 'partner',
    entityId: 'partnerCode',
    language: 'fr',
    category: 'email',
    type: 'verification'
  }, {
      username: 'rahul'
    });
  ```
