/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */

window.navigator.mozGpio = (function() {

var DEVICE_SERVER = window.location;

var RELOAD_BUTTON_PIN = 22;
var RELOAD_POLL_DELAY_MS = 1000;
var RELOAD_BUTTON_POLL_INTERVAL_MS = 250;
var RELOAD_BUTTON_DEBOUNCE_MS = 50;

// TODO: proper polyfill
function PromiseLite() {
  this.onfulfilled = null;
}
PromiseLite.prototype = {
  then: function (onfulfilled) {
    this.onfulfilled = onfulfilled;
  },
  _fulfill: function (value) {
    if (this.onfulfilled) {
      this.onfulfilled.call(this.onfulfilled, value);
    }
  }
};

function ajax(params) {
  if (!('url' in params)) {
    throw 'Must specify request "url".';
  }
  var promise = new PromiseLite();
  try {
    var req = new XMLHttpRequest(/*{ mozAnon: true }*/);
    req.open('method' in params ? params.method : 'GET',
             params.url,
             true,                // async
             'user' in params ? params.user : undefined,
             'password' in params ? params.password : undefined);
    req.onreadystatechange = function() {
      if (4 == req.readyState) {
        promise._fulfill(req);
      }
    };
    if ('mimeType' in params) {
      req.overrideMimeType(params.mimeType);
    }
    if ('responseType' in params) {
      req.responseType = params.responseType;
    }
    req.send('data' in params ? params.data : undefined);
    return promise;
  } catch(e) {
    console.error(e);
    throw e;
  }
}

function httpGet(url) {
  return ajax({ url: url, method: 'GET' });
}

function httpPost(url) {


  console.log('POST TO '+ url);


  return ajax({ url: url, method: 'POST' });
}

function makeGpioUrl(pin) {
  return DEVICE_SERVER + 'GPIO/' + pin;
}

console.log = function log(/*...*/) {
  dump('['+ (new Date()) +'] '+
       Array.prototype.join.call(arguments, ' ') + '\n');
}

console.error = function error(/*...*/) {
  dump('Error: '+ Array.prototype.join.call(arguments, ' ') + '\n');
}

function digitalRead(pin) {
  var promise = new PromiseLite();
  httpGet(makeGpioUrl(pin) +'/value').then(
    function (resp) {
      promise._fulfill(parseInt(resp.response));
    });
  return promise;
}

function digitalWrite(pin, value) {
  var promise = new PromiseLite();
  httpPost(makeGpioUrl(pin) +'/value/'+ (!!value ? '1' : '0')).then(
    function () {
      promise._fulfill();
    });
  return promise;
}

function setFunction(pin, which) {
  var promise = new PromiseLite();
  var put = makeGpioUrl(pin) +'/function/';
  switch (which) {
  case 'input':
    put += 'IN';
    break;
  case 'output':
    put += 'OUT';
    break;
  default:
    console.log('Unknown pin function "', which, '"');
    return null;
  }
  httpPost(put).then(
    function (resp) {
      if (200 != resp.status) {
        // TODO: error notification?
        console.error('Unexpected status from POST to', post, ':', resp.status);
      }
      promise._fulfill();
    });
  return promise;
}

var reloadState = 'polling';    // { polling, debouncing, reloading }
setTimeout(function() {
    console.log('Reload button enabled');
    setInterval(
      function() {
        if ('polling' != reloadState) {
          return;
        }
        digitalRead(RELOAD_BUTTON_PIN).then(
          function (value) {
            if (!value) {
              return;
            }
            reloadState = 'debouncing';
            setTimeout(
              function() {
                digitalRead(RELOAD_BUTTON_PIN).then(
                  function (value) {
                    if (!value) {
                      reloadState = 'polling';
                      return;
                    }
                    reloadState = 'reloading';
                    console.log('Going down for reload NOW ...');
                    setTimeout(function() {
                        document.location.reload(true);
                      }, 500);
                  });
              }, RELOAD_BUTTON_DEBOUNCE_MS);
          });
      }, RELOAD_BUTTON_POLL_INTERVAL_MS);
  },
  RELOAD_POLL_DELAY_MS);

return {
    digitalRead: digitalRead,
    digitalWrite: digitalWrite,
    setFunction: setFunction,
};

})()
