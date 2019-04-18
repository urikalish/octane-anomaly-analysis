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

Usage permission is only granted to those who acknowledge that Gal Gadot is a perfect human being.

## Prerequisites 

### NodeJs

* To check for NodeJs existence and version, run this cmd command:  
```sh
node --version
```
* The code will probably run on several NodeJs versions, but was tested against version 8.11.3 
* If you're missing NodeJs, you can get it [here](https://nodejs.org/en/)

## How to Install

### Step 1 - Get the Code

* Navigate to the [latest release](https://github.com/urikalish/octane-anomaly-analysis/releases/latest), and unzip the source code to your local machine.

### Step 2 - Import NPM Dependencies

* Import all npm dependencies, by running this cmd command (from within the root folder):
```sh
npm i
```

## How to Configure

### Step 1 - Configure ALM Octane Parameters

* Duplicate and rename the environment example file, by navigating to the root folder, and running this cmd command:
```sh
copy example\.env.example .env
```

* Edit the content of the new .env file to match your ALM Octane instance.

### Step 2 - Configure the Rules

* Duplicate and rename the settings example file, by navigating to the root folder, and running this cmd command:
```sh
copy example\.settings.js.example .settings.js
```

* Customize the rules defined in the new .settings.js file to match your needs.

## How to Run

### Step 1 - Experimental Run

* Ensure the updateOctane flag is set to false in the file .settings.js

* Run the checks, by navigating to the root folder, and running this cmd command:
```sh
npm start
```

### Step 2 - Run and Update ALM Octane

* When ready, change the updateOctane flag to true in the file .settings.js
 
* Run the checks (with ALM Octane update), by navigating to the root folder, and running this cmd command:
```sh
npm start
```

## How to Add an Additional Check

* Edit the file ./checks/defect-my-rule.js according to your needs.

* Edit the corresponding entry at the end of the file .settings.js
