/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */

var LED_PIN = 25;
var LED_BLINK_INTERVAL_MS = 1000;

var ledOn = false;

window.onerror = function(e) {
  console.error('Uncaught exception: '+ e);
}

window.addEventListener("load", function() {
    console.log('Loaded! Setting LED pin function to "output" ...');
    navigator.mozGpio.setFunction(LED_PIN, 'output').then(
      function() {
        console.log('  ... done.  Starting blink sequence.');
        setInterval(function() {
            ledOn = !ledOn;
            navigator.mozGpio.digitalWrite(LED_PIN, ledOn).then(
              function() {
                document.body.style.backgroundColor =
                  ledOn ? 'green' : 'black';
              });
          },
          LED_BLINK_INTERVAL_MS);
      });
  });
