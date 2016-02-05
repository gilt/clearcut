# Clearcut [![Build Status](https://travis-ci.org/shellscape/clearcut.svg?branch=master)](https://travis-ci.org/shellscape/clearcut)

A Javascript utility for wrapping the browser console logging mechanisms.

## Beautiful Output

![Clearcut Screenshot](screenshot.png?raw=true "Clearcut Screenshot")

## Provisions

Clearcut provides several enhancements over the standard console;

- Multiple "channels" for logging, each with their own options.
- Separate vocal states for channels; on or off.
- The ability to force a channel to be vocal.
- An accessible log history.
- Fallbacks for browsers that don't support string replacement or styles in the
  console.
- Automatical line prefixing.
- Transports, for sending log data to other places.
