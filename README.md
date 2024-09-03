# AutoC4

This is the control panel used by the CCC Cologne, for its home automation.

## Requirements

- NodeJS 20+

## Planned changes

* Make more stuff configurable via config.json
* Make AutoC4 class emit events instead of having unused methods in the Module class
* Automatic discovery for devices
* Dependency injection for plugins?
* Get rid of jQuery (at least for the AutoC4 part)

## Licensing

This project is licensed under the MIT license, as reproduced in `LICENSE`.

Included dependencies are covered by their respective license as specifed in their header, i.e.:

* Bootstrap is under MIT license:
  * public/lib/bootstrap/bootstrap.min.css, src/lib/bootstrap.min.js
* jQuery is under MIT license <http://jquery.org/license>:
  * public/lib/jquery-3.7.1.min.js
* Paho JavaScript Client is under EPL v1.0 and EDL v1.0 as reproduced in LICENSE-EPLv10 and LICENSE-EDLv10
  * public/lib/mqttws31.js
