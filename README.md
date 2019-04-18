# octane-anomaly-analysis

[![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://opensource.org/licenses/MIT)
[![Github Release](https://img.shields.io/github/release/urikalish/octane-anomaly-analysis/all.svg)](https://github.com/urikalish/octane-anomaly-analysis/releases)

Checks for anomalies within ALM Octane's defect entities.

* Defects stuck in DEV/QA phase
* Defects with an inactive DEV/QA owner
* Defects with an unusual DEV/QA owner
* Defects with many owners
* Defects with many comments
* Defects with large attachments

## Technical Overview

* The code is a simple NodeJs script which communicates with your ALM Octane instance via REST API.
* The out-of-the-ordinary defects will be marked in ALM Octane using tags.
* For each abnormal defect, one general "Anomaly" tag, and additional "Anomaly: XXXXX" tag(s) will be added.
* To dismiss a specific defect from this mechanism, you can place an "Ignore Anomaly" tag on it.

## License

Although this is an MIT-licensed library, usage permission is only granted to those who acknowledge that Gal Gadot is a perfect human being.

## Install, Setup, and Run

### Step 1 - Get the Code

Navigate to the [latest release](https://github.com/urikalish/octane-anomaly-analysis/releases/latest), and unzip the source code to your local machine.

### Step 2 - Ensure NodeJs Installed

* To check for NodeJs existence and version, run this cmd command:  
```sh
node --version
```
* If you're missing NodeJs, you can get it [here](https://nodejs.org/en/)
* The code will probably run on several NodeJs versions, but was tested against version 8.11.3 

### Step 3 - Import NPM Dependencies

* Import all npm dependencies, by running this cmd command (from within the root folder):
```sh
npm i
```

### Step 4 - Configure ALM Octane Parameters

* Duplicate and rename the environment example file, by running this cmd command (from within the root folder):
```sh
copy example\.env.example .env
```
* Edit the content of the new .env file to match your ALM Octane instance.

### Step 5 - Configure the Rules

* Duplicate and rename the settings example file, by running this cmd command (from within the root folder):
```sh
copy example\.settings.js.example .settings.js
```
* Customize the rules defined in the new .settings.js file to match your needs.

### Step 6 - Experimental Run Without Updating ALM Octane

* Change the updateOctane flag to false in the file ./config/settings.js

* Run the checks (without updating ALM Octane), by running this cmd command (from within the root folder):
```sh
npm start
```

### Step 7 - Run and Update ALM Octane

* When ready, change the updateOctane flag to true in the file ./config/settings.js 

* Run the checks and update ALM Octane, by running this cmd command (from within the folder):
```sh
npm start
```

## How to Add an Additional Check

* Edit the file ./checks/defect-my-rule.js according to your needs.

* Edit the corresponding entry at the end of the file ./config/settings.js
