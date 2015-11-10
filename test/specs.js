
var classes = document.documentElement.className,
  prefix = {
    text: '%cG',
    style: 'background: #fff7e5; border: 1px solid #e09d00; color: #e09d00;' +
           'padding: 2px 3px 1px 3px; line-height: 11px; font: bold 12px ' +
           '"Times New Roman"; {margin};'
  },
  margins = {
    chrome: 'margin: 0 6px 0 -20px',
    ff: 'margin: 0 6px 0 -29px', // firefox
    safari: 'margin: 0 6px 0 -17px'
  },
  regexp;

prefix.style = prefix.style.replace('{margin}', margins['chrome']);

log.options({ prefix: prefix });

log('hello')
log.info('info')
log.error('error')
log.warn('warning')

// describe('Clearcut', function() {

  // it('should live in the global namespace', function () {
  //   expect(window._clearcut).to.exist;
  //   expect(window.log).to.exist;
  // });

// });
