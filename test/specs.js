/* globals log: false */

var classes = document.documentElement.className,
  prefix = {
    text: '%cc',
    style: 'background: #fff7e5; border: 1px solid #e09d00; color: #e09d00;' +
           'padding: 2px 3px 1px 3px; line-height: 11px; font: bold 12px ' +
           '"Times New Roman"; {margin}; z-index: 999;'
  },
  margins = {
    chrome: 'margin: 0 6px 0 -20px',
    ff: 'margin: 0 6px 0 -29px',
    safari: 'margin: 0 6px 0 -17px'
  },
  regexp;

prefix.style = prefix.style.replace('{margin}', margins.chrome);

log.options({ prefix: prefix });

describe('Clearcut', function() {

  it('should live in the global namespace', function () {
    expect(window.__clearcut__).to.exist;
    expect(window.log).to.exist;
  });

  // it('should contain all of the methods of the console object', function () {
  //
  // });

  it('should call methods successfully', function () {
    log('hello');
    log.info('info');
    log.error('error');
    log.warn('warning');

    expect(true).to.equal(true);
  });

  it('should handle thrown errors', function () {
    try {
      throw new Error('Oh noes!');
    }
    catch (e) {
      log.error(e, {foo: 'bar'}, ['bvaz']);
    }

    expect(true).to.equal(true);
  });

});
