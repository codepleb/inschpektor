## INSCHPEKTOR

This is a manager for your IOTA node with focus on simplicity and user experience. It will take a lot of manual work off your shoulders. :)

### Features

For the features and future outlook, head over to my medium article: https://medium.com/@codepleb4/inschpektor-the-user-friendly-peer-manager-for-your-iota-node-c820d5243964

### Installation

#### Precondition

**People with a debian linux system:**
If you are on a debian linux system (Ubuntu for example), all you need to do is run this command: `sudo apt install -y build-essential && sudo apt install -y curl && sudo apt-get purge nodejs -y && curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash - && sudo apt-get update -yqq --fix-missing && sudo apt-get install -y nodejs && sudo npm i npm@latest -g`
If you are not on a debian system, check this link and install nodejs for your system: https://nodejs.org/en/download/

**People without a debian linux system:**

- You need a recent version of node to successfully run this app (10.8+). Check https://nodejs.org/en/download/ and download & install the version for your system.
- Install `curl`
- Install `make`
- Install `build-essential`

All of the things in this list are unconfirmed. I do not know if those are all the packages you need on other systems and I also do not know if they all are needed.

#### Install inschpektor

Run `sudo npm i -g inschpektor --unsafe-perm`

`--unsafe-perm` is needed on linux. It was not needed on my MacOS and I'm not sure about windows. The reason are the npm submodules that need to run with sudo permissions too (the bcrypt dependency leads to this necessity).

### Running after installation

Always run this command in a terminal: `sudo inschpektor` (it is recommended to start inschpektor with `sudo` permissions. The reason is, that depending on how you setup your IOTA node, inschpektor cannot restart your IOTA node and probably cannot write to your iri config file upon adding/removing neighbors). If you are a skilled linux user and you know the permission system, using sudo is not necessary at all.

After that, you will find it in your browser @ <http://{YOUR-IP}:8732> (tested on Google Chrome and Firefox, desktop and mobile).

### Register node

When you first open the webapp (or when you clicked the 'Reset Inschpektor' button), you can define your node and things related to it.

- HTTPS: If you DO NOT run inschpektor on the same machine, as the your iri runs, and you generally access it over https, then enable that toggle.
- Password: This password can be freely chosen and is not related to anything else than inschpektor.
- Path to iri config (Optional): Please provide the full path to your iri config file, if you want to have inschpektor edit your iri config (for instance, if you add a neighbor or remove one and want to have that persisted in the iri - no more manual work needed).
- Command to restart node (Optional): Any linux command. This will be executed upon clicking the button 'Restart Node' in the 'Manage' view in inschpektor. In my case, the command would be `systemctl restart iota`. NOTE: Don't write `sudo` or anything in here. As soon as this command triggers something like a password prompt, it will not work. If you started inschpektor with `sudo`, it will be sufficient.

### Update

To get the newest version (or ignore, if you already have it), you can just run the installation command again and it will do the rest for you.

### Video Instructions

I recorded videos on how to install and use inschpektor. If you want, look them up here: https://www.youtube.com/watch?v=EjXs7kpBqjQ&list=PLAjtvx6a60HLvuLDphPaFRhD3Oe0NVn9J

### Installing inschpektor as an app

Inschpektor can be installed and used like a normal application. This is more than just a website bookmark!

**iOS:** Open Safari (only Safari will work), browse to your inschpektor URL, click on 'share', 'Add to Home Screen'.
**Android:** Open Chrome, browse to your inschpektor URL, clicke the three dots on the top right, 'Add to Home Screen' or 'Install Inschpektor'
**Windows/MacOs:** Open Chrome/Firefox, browse to your inschpektor URL, clicke the three dots on the top right, 'Install Inschpektor'

### Activate Notifications

For iOs, this sadly is not possible at this time, because Apple does not yet allow the 'push api' that is supposed to work cross-platform.

For all other devices, open inschpektor, go to 'Manage' and click on the 'Enable Notifications' button. You will have to accept the request that is popping up and you are set up!

Keep in mind, that whenever you reset inschpektor or update it, you have to register for notifications again. This might be obsolete in the future.

### Donations

If you want to show some love, I always appreciate it. :) Here are some crypto addresses.

**IOTA:** IZ99FQWJUQJCDLBSUOEDZIVROSARFYLXJWPZNAXQPCCGAHCUWKRE9RNHMGNHZTAIZHPUDV9HMSPNJLYSXPNEPTRHUW

**BTC:** 32o6kbgZqJ9nhT2aRsfEGcMtpThJ2za89T

**LTC:** LgfSNjqVpXFj9xN8ZWPR9qTZQJpcRRNXRZ

**XMR:** 4GdoN7NCTi8a5gZug7PrwZNKjvHFmKeV11L6pNJPgj5QNEHsN6eeX3DaAQFwZ1ufD4LYCZKArktt113W7QjWvQ7CWAjwVCr95LATLKqtxr

**XLM:** GA5XIGA5C7QTPTWXQHY6MCJRMTRZDOSHR6EFIBNDQTCQHG262N4GGKTM

**XRP:** rLHzPsX6oXkzU2qL12kHCH8G8cnZv1rBJh

### Feedback

Find me on Telegram @codepleb or on the iota discord codepleb.net#9990 for direct feedback.

Also keep in mind that I run channels where I post updates:

- Twitter: https://twitter.com/codepleb4
- Telegram Broadcast: https://t.me/inschpektor

## Tips & Help

- **Premium neighbors:** To become a premium neighbor yourself to others, you need to allow the "getNodeInfo" in your node's iri configuration. To do this, ensure that `getNodeInfo` is **not** in the `REMOTE_LIMIT_API` field of your IRI config.
- **Permission errors:** When you get permission errors on the console, it might be that your iota.ini file has wrong access rights or that your node runs as a service and only the root user can handle it without a password prompt (or various other permission reasons). You can just run `inschpektor` as root user (before running inschpektor, type `sudo -s` and enter your password) in this case. That will work, but I want to say that doing this is generally a very bad habit which can make your computer vulnerable.
- **Performance:** If you want to increase the performance, serve inschpektor over HTTPS. This way, the service worker will get enabled and be able to put a lot of calls and the site skeleton into the cache.

### Features/Improves on the roadmap

- Go further down the PWA road and make the app more "native like"
- Make everything more stable
- Overhaul this overly fancy UI :)

### Known Bugs

- If you have a premium neighbor which uses a port other than the standard 14265, you won't get the additional info from his node and he won't show up as premium in your overview. It's more like a "not fully complete" feature instead of a bug though.

---

## Developer Info

### Project setup

```
npm install
```

#### Compiles and hot-reloads for development

```
npm run serve
```

#### Compiles and minifies for production

```
npm run build
```

#### Run your tests

```
npm run test
```

#### Lints and fixes files

```
npm run lint
```

#### Run your end-to-end tests

```
npm run test:e2e
```

#### Run your unit tests

```
npm run test:unit
```
