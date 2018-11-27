const loggerClass = class Logger {
  constructor(showDuringTests) {
    if (typeof (showDuringTests) !== 'undefined') {
      this.showDuringTests = showDuringTests;
    }
  }
  static log(...msg) {
    if ((process.env.NODE_ENV === 'test' && this.showDuringTests)
            || (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'production')) {
      console.log(...msg); // eslint-disable-line no-console
    }
    return msg;
  }
  static error(...msg) {
    if ((process.env.NODE_ENV === 'test' && this.showDuringTests)
            || (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'production')) {
      console.error(...msg); // eslint-disable-line no-console
    }
    return msg;
  }
  static warn(...msg) {
    if ((process.env.NODE_ENV === 'test' && this.showDuringTests)
            || (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'production')) {
      console.warn(...msg); // eslint-disable-line no-console
    }
    return msg;
  }
};

loggerClass.showDuringTests = false;

export default loggerClass;
