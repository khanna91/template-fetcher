const AWS = require('aws-sdk');
const Mustache = require('mustache');
const TemplateError = require('./errorHandler');

// stores the s3 object of AWS
let s3Bucket;
let bucketName;
let folderName;

const MISSINGPARAM = 'MissingParam';
const MISSINGCONFIG = 'MISSINGCONFIG';
const MISSINGBUCKET = 'MISSINGBUCKET';
const MISSINGFOLDER = 'MISSINGFOLDER';

/**
 * Function is used to setup the s3 bucket and enabling s3
 * @param {Object} config   contains the aws configuration
 */
const build = (config = {}) => {
  checkForRequired('region', config.region, MISSINGCONFIG);
  checkForRequired('access key', config.accessKeyId, MISSINGCONFIG);
  checkForRequired('secret access', config.secretAccessKey, MISSINGCONFIG);
  checkForRequired('bucket name', config.bucketName, MISSINGBUCKET);
  checkForRequired('folder name', config.folderName, MISSINGFOLDER);

  AWS.config.update({
    region: config.region,
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey
  });

  bucketName = config.bucketName;
  folderName = config.folderName;

  s3Bucket = new AWS.S3({
    params: { Bucket: bucketName },
    apiVersion: '2012-10-17'
  });
}

/**
 * Validator function to check for required
 * @param {String} name   Field name which needs to be validated
 * @param {String} value  Field value which will be validated
 * @param {String} code   Error code, if validation fails
 */
const checkForRequired = (name, value, code = MISSINGPARAM) => {
  if (!value) {
    throw new TemplateError(`Invalid parameter - Missing ${name}`, code);
  }
}

/**
 * Function to validate the parameters
 * @param {Object} props  contains the information about template
 */
const validateProps = (props) => {
  checkForRequired('entity', props.entity);
  checkForRequired('entityId', props.entityId);
  checkForRequired('category', props.category);
  checkForRequired('type', props.type);
  checkForRequired('language', props.language);

  return true;
}

/**
 * Function to format the final filename
 * @param {Object} props  contains the information about template
 */
const curateFileLocation = (props) => (`${folderName}/${props.entity}/${props.entityId}/${props.category}/${props.type}/${props.language}.txt`);

/**
 * Function to retrieve the template from s3 bucket
 * @param {Object} props  contains the information about template
 */
const getTemplate = async (props) => {
  const fileName = curateFileLocation(props);
  const data = await s3Bucket.getObject({ Key: fileName }).promise();
  return data.Body.toString('utf8');
}

/**
 * Error handling function
 * @param {Any} err   error object
 */
const handleError = (err) => {
  if (err instanceof TemplateError) {
    throw err;
  }
  throw new TemplateError(err.message, err.code);
}

/**
 * Function to fetch the raw template from s3 bucket
 * @param {Object} props  contains the information about template
 */
const raw = async (props) => {
  try {
    validateProps(props);
    const template = await getTemplate(props);

    return template;
  } catch (err) {
    throw handleError(err);
  }
}

/**
 * Function to fetch the interpolated template from s3 bucket
 * @param {Object} props  contains the information about template
 * @param {Object} data  contains the data which needs to be replaced
 */
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