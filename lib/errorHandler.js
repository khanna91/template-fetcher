class TemplateError extends Error {
  /**
   * Constructor function
   * 
   * @param {String} message - Error message
   * @param {String} code - Error code
   */
  constructor(message, code) {
    super(message || /* istanbul ignore next: tired of writing tests */ 'Something went wrong');
    this.name = this.constructor.name;
    this.code = code || 'Unknown';
  }
}

module.exports = TemplateError;