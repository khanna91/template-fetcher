const AWS = require('aws-sdk');
const Mustache = require('mustache');
const TemplateError = require('./errorHandler');

let s3Bucket;

const MISSINGPARAM = 'MissingParam';
const MISSINGCONFIG = 'MISSINGCONFIG';

const build = (config = {}) => {
  checkForRequired('region', config.region, MISSINGCONFIG);
  checkForRequired('access key', config.accessKeyId, MISSINGCONFIG);
  checkForRequired('secret access', config.secretAccessKey, MISSINGCONFIG);

  AWS.config.update({
    region: config.region,
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey
  });

  s3Bucket = new AWS.S3({
    params: { Bucket: 'astro-template-service' },
    apiVersion: '2012-10-17'
  });
}

const checkForRequired = (name, value, code = MISSINGPARAM) => {
  if (!value) {
    throw new TemplateError(`Invalid parameter - Missing ${name}`, code);
  }
}

const validateProps = (props) => {
  checkForRequired('entity', props.entity);
  checkForRequired('entityId', props.entityId);
  checkForRequired('category', props.category);
  checkForRequired('type', props.type);
  checkForRequired('language', props.language);

  return true;
}

const curateFileLocation = (props) => (`templates/${props.entity}/${props.entityId}/${props.category}/${props.type}/${props.language}.txt`);

const getTemplate = async (props) => {
  const fileName = curateFileLocation(props);
  const data = await s3Bucket.getObject({ Key: fileName }).promise();
  return data.Body.toString('utf8');
}

const handleError = (err) => {
  if (err instanceof TemplateError) {
    throw err;
  }
  throw new TemplateError(err.message, err.code);
}

const raw = async (props) => {
  try {
    validateProps(props);
    const template = await getTemplate(props);

    return template;
  } catch (err) {
    throw handleError(err);
  }
}

const interpolate = async (props, data = {}) => {
  try {
    validateProps(props);
    const template = await getTemplate(props);
    const interpolatedTemplate = Mustache.render(template, data);
    return interpolatedTemplate;
  } catch (err) {
    throw handleError(err);
  }
}

module.exports = {
  build,
  raw,
  interpolate,
  handleError,
  getTemplate,
  curateFileLocation,
  validateProps,
  checkForRequired
}