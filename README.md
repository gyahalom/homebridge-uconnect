<SPAN ALIGN="CENTER" STYLE="text-align:center">
<DIV ALIGN="CENTER" STYLE="text-align:center">

[![homebridge-uconnect: Native HomeKit support for Uconnect car door lock and engine start](https://raw.githubusercontent.com/gyahalom/homebridge-uconnect/main/homebridge-uconnect.svg)](https://github.com/gyahalom/homebridge-uconnect)

# Homebridge Uconnect
[![Downloads](https://img.shields.io/npm/dt/homebridge-uconnect?color=%235EB5E5&logo=icloud&logoColor=%23FFFFFF&style=for-the-badge)](https://www.npmjs.com/package/homebridge-uconnect)
[![Version](https://img.shields.io/npm/v/homebridge-uconnect?color=%235EB5E5&label=Homebridge%20Uconnect&logoColor=%23FFFFFF&style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBzdHlsZT0iZmlsbDojRkZGRkZGIiBkPSJNMjMuOTkzIDkuODE2TDEyIDIuNDczbC00LjEyIDIuNTI0VjIuNDczSDQuMTI0djQuODE5TC4wMDQgOS44MTZsMS45NjEgMy4yMDIgMi4xNi0xLjMxNXY5LjgyNmgxNS43NDl2LTkuODI2bDIuMTU5IDEuMzE1IDEuOTYtMy4yMDIiLz48L3N2Zz4K)](https://www.npmjs.com/package/homebridge-uconnect)
[![verified-by-homebridge](https://img.shields.io/badge/homebridge-verified-blueviolet?color=%2357277C&style=for-the-badge&logoColor=%23FFFFFF&logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI5OTIuMDkiIGhlaWdodD0iMTAwMCIgdmlld0JveD0iMCAwIDk5Mi4wOSAxMDAwIj48ZGVmcz48c3R5bGU+LmF7ZmlsbDojZmZmO308L3N0eWxlPjwvZGVmcz48cGF0aCBjbGFzcz0iYSIgZD0iTTk1MC4xOSw1MDguMDZhNDEuOTEsNDEuOTEsMCwwLDEtNDItNDEuOWMwLS40OC4zLS45MS4zLTEuNDJMODI1Ljg2LDM4Mi4xYTc0LjI2LDc0LjI2LDAsMCwxLTIxLjUxLTUyVjEzOC4yMmExNi4xMywxNi4xMywwLDAsMC0xNi4wOS0xNkg3MzYuNGExNi4xLDE2LjEsMCwwLDAtMTYsMTZWMjc0Ljg4bC0yMjAuMDktMjEzYTE2LjA4LDE2LjA4LDAsMCwwLTIyLjY0LjE5TDYyLjM0LDQ3Ny4zNGExNiwxNiwwLDAsMCwwLDIyLjY1bDM5LjM5LDM5LjQ5YTE2LjE4LDE2LjE4LDAsMCwwLDIyLjY0LDBMNDQzLjUyLDIyNS4wOWE3My43Miw3My43MiwwLDAsMSwxMDMuNjIuNDVMODYwLDUzOC4zOGE3My42MSw3My42MSwwLDAsMSwwLDEwNGwtMzguNDYsMzguNDdhNzMuODcsNzMuODcsMCwwLDEtMTAzLjIyLjc1TDQ5OC43OSw0NjguMjhhMTYuMDUsMTYuMDUsMCwwLDAtMjIuNjUuMjJMMjY1LjMsNjgwLjI5YTE2LjEzLDE2LjEzLDAsMCwwLDAsMjIuNjZsMzguOTIsMzlhMTYuMDYsMTYuMDYsMCwwLDAsMjIuNjUsMGwxMTQtMTEyLjM5YTczLjc1LDczLjc1LDAsMCwxLDEwMy4yMiwwbDExMywxMTEsLjQyLjQyYTczLjU0LDczLjU0LDAsMCwxLDAsMTA0TDU0NS4wOCw5NTcuMzV2LjcxYTQxLjk1LDQxLjk1LDAsMSwxLTQyLTQxLjk0Yy41MywwLC45NS4zLDEuNDQuM0w2MTYuNDMsODA0LjIzYTE2LjA5LDE2LjA5LDAsMCwwLDQuNzEtMTEuMzMsMTUuODUsMTUuODUsMCwwLDAtNC43OS0xMS4zMmwtMTEzLTExMWExNi4xMywxNi4xMywwLDAsMC0yMi42NiwwTDM2Ny4xNiw3ODIuNzlhNzMuNjYsNzMuNjYsMCwwLDEtMTAzLjY3LS4yN2wtMzktMzlhNzMuNjYsNzMuNjYsMCwwLDEsMC0xMDMuODZMNDM1LjE3LDQyNy44OGE3My43OSw3My43OSwwLDAsMSwxMDMuMzctLjlMNzU4LjEsNjM5Ljc1YTE2LjEzLDE2LjEzLDAsMCwwLDIyLjY2LDBsMzguNDMtMzguNDNhMTYuMTMsMTYuMTMsMCwwLDAsMC0yMi42Nkw1MDYuNSwyNjUuOTNhMTYuMTEsMTYuMTEsMCwwLDAtMjIuNjYsMEwxNjQuNjksNTgwLjQ0QTczLjY5LDczLjY5LDAsMCwxLDYxLjEsNTgwTDIxLjU3LDU0MC42OWwtLjExLS4xMmE3My40Niw3My40NiwwLDAsMSwuMTEtMTAzLjg4TDQzNi44NSwyMS40MUE3My44OSw3My44OSwwLDAsMSw1NDAsMjAuNTZMNjYyLjYzLDEzOS4zMnYtMS4xYTczLjYxLDczLjYxLDAsMCwxLDczLjU0LTczLjVINzg4YTczLjYxLDczLjYxLDAsMCwxLDczLjUsNzMuNVYzMjkuODFhMTYsMTYsMCwwLDAsNC43MSwxMS4zMmw4My4wNyw4My4wNWguNzlhNDEuOTQsNDEuOTQsMCwwLDEsLjA4LDgzLjg4WiIvPjwvc3ZnPg==)](https://github.com/homebridge/homebridge/wiki/Verified-Plugins)

## Uconnect car lock/unlock and engine start/stop support for [Homebridge](https://homebridge.io).
</DIV>
</SPAN>

`homebridge-uconnect` is a [Homebridge](https://homebridge.io) plugin that makes Uconnect-enabled cars (which include an active SiriusXM Guardian subscritpion) available to [Apple's](https://www.apple.com) [HomeKit](https://www.apple.com/ios/home) smart home platform. 
Uconnect remote commands are available on several models of Chrysler, Didge, Jeep, Ram and Fiat. Though I have only tested this module with my own car (2022 Chrysler Pacifica Hybrid). Please feel free to buy me more cars for testing :).

*NOTE:* Make sure you can submit remote commands to your car via the [Uconnect app](https://www.driveuconnect.com/uconnect-app.html) or [Mopar website](https://www.mopar.com) to ensure this plugin will work with your car as well.

## Why use this plugin for Uconnect support in HomeKit?
My motivation in creating this plugin was to enable Siri control over the basic remote car functions (lock/unlock doors, start/stop engine), as well as allow adding the functions to HomeKit automations (e.g. lock doors ar night when person is at home etc.).
The plugin will discover all Uconnect supported cars associated with your Mopar account after providing your account credentials in the configuration. Since there is no indication of the doors lock state or engine state, unfortunately the functions cannot be implemented as a "true" lock/switch accessory. The solution used resembles the one in the Uconnect app where there is a separate control for each function - lock door/unlock door/start engine/stop engine.
I have tested these functionalities with my car and they work reasonable well (with some delay as with the regular Uconnect app) and allow Siri automation and use in shortcuts and scenes. However I have done very limited testing, please feel free to let me know if this works (or not) for your case, I will try to resolve any issues I can but it is not my day job, I welcome contributions and Pull Requests.

### Features
- ***Easy* configuration - all you need is your Mopar username email, password and Uconnect 3 digit PIN to get started.**.

- **Automatic detection and configuration of all supported cars.** By default - all of your supported cars are made available in HomeKit.

## Documentation
* [Installation](#installation): installing this plugin, including system requirements.
* [Plugin Configuration](#plugin-configuration): how to quickly get up and running.
* [Additional Notes](#notes): some things you should be aware of, including myQ-specific quirks.
* [Changelog](https://github.com/gyahalom/homebridge-uconnect/blob/master/Changelog.md): changes and release history of this plugin.

## Installation
If you are new to Homebridge, please first read the [Homebridge](https://homebridge.io) [documentation](https://github.com/homebridge/homebridge/wiki) and installation instructions before proceeding.

If you have installed the [Homebridge Config UI](https://github.com/oznu/homebridge-config-ui-x), you can intall this plugin by going to the `Plugins` tab and searching for `homebridge-uconnect` and installing it.

If you prefer to install `homebridge-uconnect` from the command line, you can do so by executing:

```sh
sudo npm install -g homebridge-uconnect
```

### Things To Be Aware Of
- As mentioned above the plugin will add an accessory tile for each supported car associated with your Mopar account
- Each accessory will contain 4 elements:
  - `Car Lock` - A lock in the UNSECURE position to enable remote locking. After locking it will automatically revert to the UNSECURE position after 3 seconds.
  - `Car Unlock` - A lock in the SECURE position to enable remote unlocking. After unlocking it will automatically revert to the SECURE position after 3 seconds.
  - `Car Start Engine` - A switch in the OFF position to enable remote engine start. After starting it will automatically revert to the OFF position after 3 seconds.
  - `Car Stop Engine` - A switch in the ON position to enable remote engine stop. After stopping it will automatically revert to the ON position after 3 seconds.
- You can separate these controls into separate tiles in the Home App accessory settings if you prefer.

## Plugin Configuration
If you choose to configure this plugin directly instead of using the [Homebridge Configuration web UI](https://github.com/oznu/homebridge-config-ui-x), you'll need to add the platform to your `config.json` in your home directory inside `.homebridge`.

```js
"platforms": [{
    "platform": "uconnect",
    "email": "email@email.com",
    "password": "password",
    "pin": "1234",
    "timeout": 30
}]
```

For most people, I recommend using [Homebridge Configuration web UI](https://github.com/oznu/homebridge-config-ui-x) to configure this plugin rather than doing so directly. It's easier to use for most users, especially newer users, and less prone to typos, leading to other problems.
