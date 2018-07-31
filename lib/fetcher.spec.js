require('dotenv-safe').config();
const sinon = require('sinon');
const { expect } = require('chai');
const rewire = require('rewire');

const TemplateFetcher = rewire('./fetcher');

const sandbox = sinon.createSandbox();

describe('TemplateFetcher', () => {
  let fetcher;
  const ACCESS_DENIED = 'Access Denied';
  const MISSINGPARAM = 'MissingParam';
  const MISSINGCONFIG = 'MISSINGCONFIG';

  beforeEach(() => {
    TemplateFetcher.build({
      region: process.env.region,
      accessKeyId: process.env.accessKeyId,
      secretAccessKey: process.env.secretAccessKey
    });
  });

  afterEach(() => sandbox.restore());

  it('should fetch the raw template', async () => {
    const template = await TemplateFetcher.raw({
      entity: 'partner',
      entityId: 'partnerCode',
      language: 'fr',
      category: 'email',
      type: 'verification'
    });
    expect(template).to.be.a('string');
  });

  it('should fetch the interpolated template', async () => {
    const template = await TemplateFetcher.interpolate({
      entity: 'partner',
      entityId: 'partnerCode',
      language: 'fr',
      category: 'email',
      type: 'verification'
    }, {
        username: 'rahul'
      });
    expect(template).to.be.a('string');
  });

  it('should throw error for passing invalid parameters for raw', async () => {
    try {
      await TemplateFetcher.raw({
        entityId: 'partnerCode',
        language: 'fr',
        category: 'email',
        type: 'verification'
      });
    } catch (err) {
      expect(err.code).to.eqls(MISSINGPARAM);
    }
  });

  it('should throw error for passing invalid parameters for interpolate', async () => {
    try {
      await TemplateFetcher.interpolate({
        entityId: 'partnerCode',
        language: 'fr',
        category: 'email',
        type: 'verification'
      });
    } catch (err) {
      expect(err.code).to.eqls(MISSINGPARAM);
    }

    sandbox.stub(TemplateFetcher, 'getTemplate').callsFake(() => { });
  });

  it('should throw error for if getTemplate fails', async () => {
    try {
      const errorCall = sandbox.stub().rejects(new Error(ACCESS_DENIED));
      TemplateFetcher.__set__('getTemplate', errorCall);
      await TemplateFetcher.interpolate({
        entity: 'partner',
        entityId: 'partnerCode',
        language: 'fr',
        category: 'email',
        type: 'verification'
      });
    } catch (err) {
      expect(err.message).to.eqls(ACCESS_DENIED);
    }
  });

  it('should throw error for if s3 fails', async () => {
    try {
      const s3Bucket = TemplateFetcher.__get__('s3Bucket');
      const promiseStub = sandbox.stub().rejects(new Error(ACCESS_DENIED));
      sandbox.stub(s3Bucket, 'getObject').returns({ promise: promiseStub });

      await TemplateFetcher.interpolate({
        entity: 'partner',
        entityId: 'partnerCode',
        language: 'fr',
        category: 'email',
        type: 'verification'
      });
    } catch (err) {
      expect(err.message).to.eqls(ACCESS_DENIED);
    }
  });

  it('should throw error for if proper config not passed', async () => {
    try {
      TemplateFetcher.build({})
    } catch (err) {
      expect(err.code).to.eqls(MISSINGCONFIG);
    }
  });
});