class TemplateError extends Error {
  /**
   * Constructor function
   * 
   * @param {String} message - Error message
   * @param {String} code - Error code
   */
  constructor(message = 'Something went wrong', code = 'Unknown') {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
  }
}

module.exports = TemplateError;