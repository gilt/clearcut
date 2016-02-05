/**
 * Clearcut: A utility for wrapping the browser console logging mechanisms.
 *
 * @version 0.0.1
 * @license MIT
 * @repository https://github.com/gilt/clearcut
 *
 * @collaborators
 * Andrew Powell (shellscape) : https://github.com/shellscape
 *
 * @tutorial README.md
 *
 * @note
 * Inspiration derived from the following sources:
 *  - https://github.com/jbail/lumberjack
 *  - http://www.paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog
 */
 /* globals define: false */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], function () {
      return (root.clearcut = factory(root));
    });
  }
  else if (typeof module === 'object' && module.exports) {
    module.exports = factory(root);
  }
  else {
    root.clearcut = factory(root);
  }
}(this, function (root) {

  if (!Object.assign) {
    Object.defineProperty(Object, 'assign', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: function(target) {
        'use strict';
        if (target === undefined || target === null) {
          throw new TypeError('Cannot convert first argument to object');
        }

        var to = Object(target);
        for (var i = 1; i < arguments.length; i++) {
          var nextSource = arguments[i];
          if (nextSource === undefined || nextSource === null) {
            continue;
          }
          nextSource = Object(nextSource);

          var keysArray = Object.keys(nextSource);
          for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
            var nextKey = keysArray[nextIndex];
            var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
            if (desc !== undefined && desc.enumerable) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
        return to;
      }
    });
  }

  // bare bare bare naked bones sprintf for browsers that don't yet support
  // string replacement in console.log methods. *cough* IE
  function sprintf (format) {
    for( var i=1; i < arguments.length; i++ ) {
      format = format.replace( /%[sdiof]/, arguments[i] );
    }
    return format;
  }

  // this assumes modern browser versions
  // it's 2015, we don't care about older versions of these browsers.
  // older versions of the browsers considered 'supporting color' in the console
  // will simply display the %c token.
  // also don't want to be assuming color support if in PhantomJS
  function isColorSupported() {
    var ua = navigator.userAgent;
    return /(firefox|chrome|safari)/i.test(ua) && !/phantomjs/i.test(ua);
  }

  /**
   * The Clearcut Log class.
   * @class
   * @param {Object} console  The window or target console object.
   * @param {Object} options  Options for the Log's default channel.
   *
   * @returns {self}
   */
  function ClearcutLog (console, options) {
    var self = this;

    /** @member {Array} */
    this.channels = [];

    /** @member {Channel} */
    this._default = this.channel('default', options);

    function toggleChannels (state) {
      for(var i = 0; i < this.channels.length; i++) {
        this.channels[i][state].call(this.channels[i]);
      }
    }

    this.channels.on = function logChannelsOn () {
      toggleChannels('on');

      return this.channels;
    };

    this.channels.off = function logChannelsOff () {
      toggleChannels('off');

      return this.channels;
    };

    this.channels.history = function logChannelsHistory () {
      var result = {},
        channel;

      for(var i = 0; i < this.channels.length; i++) {
        channel = this.channels[i];
        result[channel.name] = channel.history();
      }

      return result;
    };

    // proxy the default channel's functions
    // this allows the Console object to use the log methods shorthand

    for (var method in this._default) {
      if (typeof this._default[method] === 'function') {
        // scope trickery
        /* jshint loopfunc: true */
        this[method] = (function (meth) {
          return function () {
            return self._default[meth].apply(self._default, arguments);
          };
        }).call(this, method);
      }
    }

    return this;
  }

  ClearcutLog.prototype.channel = function logChannel (name, options) {
    if (!this.channels[name]) {
      this.channels[name] = new ClearcutChannel(name);
    }

    return this.channels[name];
  };

  /**
   * The Clearcut Channel class.
   * @class
   * @param {string} name     The name of the Log Channel.
   * @param {Object} options  Options for the Log.
   *
   * @returns {Self}
   */
  function ClearcutChannel (name, options) {
    var defaultOptions = {
        history: true,
        enabled: true
      },
      consoleMethods;

    // have we already been initialized?
    if (this.name) {
      if (options) {
        this.options(options);
      }
      return this;
    }

    this.name = name;
    this._options = Object.assign(defaultOptions, options || {});
    this._history = [];

    consoleMethods = [
      'assert',
      'clear',
      'count',
      'debug',
      'dir',
      'dirxml',
      'error',
      'exception',
      'group',
      'groupCollapsed',
      'groupEnd',
      'info',
      'log',
      'profile',
      'profileEnd',
      'table',
      'time',
      'timeEnd',
      'timeStamp',
      'trace',
      'warn'
    ];

    for (var method, i = 0; i < consoleMethods.length; i++) {
      method = consoleMethods[i];
      /* jshint loopfunc: true */
      this[method] = (function (meth) {
        return function () {
          var args = Array.prototype.slice.call(arguments, 0);
          this.send(args, meth);
        };
      }).call(this, method);
    }

    return this;
  }

  ClearcutChannel.prototype.options = function channelOptions (options) {

    if (!options) {
      return this._options;
    }

    this._options = Object.assign(this._options, options);
    return this;
  };

  ClearcutChannel.prototype.styles = {
    error: 'color: #d8000c; border: 1px solid #d8000c; background: #ffbaba;',
    info: 'color: #00529b; border: 1px solid #00529b; background: #bde5f8;',
    ok: 'color: #4f8a10; border: 1px solid #4f8a10; background: #dff2bf;',
    warn: 'color: #d1b900; border: 1px solid #f7deae; background: #fff8c4;'
  };

  ClearcutChannel.prototype.send = function channelSend (args, method) {

    var text,
      first,
      last,
      isString = false,
      isError = false;

    last = args[args.length - 1];
    method = method || 'log';
    isError = args[0] instanceof Error;
    isString = typeof args[0] === 'string' || args[0] instanceof String;

    if (isError) {
      first = args.shift();
      first = first.stack.trim();

      if (args.length > 1) {
        first += '\n\n';
      }

      args.unshift(first);

      isError = false;
      isString = true;
    }

    if (this._options.history) {
      args.method = method;
      this._history.push(args);
    }

    if (!this._options.enabled) {
      return this;
    }

    if(!isColorSupported() && isString) {
      text = args[0].toString(); // be sure
      text = text.replace(/\%c/g, '');
      args[0] = text;
    }

    // remove any %c directives if people get silly using console.dir
    else if (method === 'dir' && isString) {
      args[0] = args[0].replace(/\%c/g, '');
    }
    else if (this._options.prefix){
      /* jshint -W014: false */
      first = this._options.prefix.text
              + '%c'; // reset the style

      if (isString) {
        first += args.shift();
      }
      else if (!isError) {
        first += 'type: ' + Object.prototype.toString.call(args[0]).slice(8, -1);
      }

      if (this._options.prefix.style) {
        args.unshift(
          first,
          this._options.prefix.style + (this.styles[method] || ''),
          (isString && !isError) ? '' : 'font-style: italic;' // required empty element to reset the style
        );
      }
    }

    if (method === 'error' || method === 'info' || method === 'warn') {
      method = 'log';
    }

    if (!console[method]) {
      method = 'log';
    }

    console[method].apply(console, args);

    return this;
  };

  /**
   * @function Channel.on
   * @desc     Enables output to the console for the channel.
   *
   * @returns {Channel}
   */
  ClearcutChannel.prototype.on = function () {
    this._options.enabled = false;
    return this;
  };

  /**
   * @function Channel.off
   * @desc     Disables output to the console for the channel.
   *
   * @note     Channels are off by default.
   *
   * @returns {Channel}
   */
  ClearcutChannel.prototype.off = function channelOff () {
    this._options.enabled = true;
    return this;
  };

  /**
   * @function Channel.history
   * @desc     Fetches and returns the currrent page log history.
   *
   * @returns {Array}
   */
  ClearcutChannel.prototype.history = function channelOn () {
    return this.history;
  };

  /**
   * @function Channel.force
   * @desc     Forces the last logging attempt to the console, regardless of
   *           if the channel is enabled or not.
   *
   * @returns {Channel}
   */
  ClearcutChannel.prototype.force = function channelForce () {
    var last;

    if (!this._options.enabled) {
      last = this.history.slice(-1)[0];
      if (last) {
        this
          .on()
          .send.apply(this, last, last.method)
          .off();
      }
    }
  };

  // instantiate a Clearcut Log.
  root.__clearcut__ = new ClearcutLog(root.console);

  /**
   * @global
   * @function log
   * @desc     Global helper function.
   *
   * @returns {ClearcutLog}
   *
   * @example
   * `log('foo');`
   * `log('foo').force();`
   * `log.warn('oh noes!');`
   * `log.off();`
   * ```
   *   var c = log.channel('bar').on();
   *   c.error('fail').off();
   * ```
   */
  root.log = Object.assign(function () {
    var args = Array.prototype.slice.call(arguments, 0);
    root.__clearcut__.send.call(this, args);
    return root.__clearcut__;
  }, root.__clearcut__);

  return root._clearcut;
}));
