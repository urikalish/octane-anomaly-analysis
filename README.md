# octane-anomaly-analysis

[![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://opensource.org/licenses/MIT)

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

* Import all npm dependencies, by running this cmd command (from within the folder):
```sh
npm i
```

### Step 4 - Configure ALM Octane Parameters

* Duplicate and rename the environment example file, by running this cmd command (from within the folder):
```sh
copy .env.example .env
```

* Edit the content of the new .env file to match your ALM Octane instance.

### Step 5 - Configure the Rules

* Customize the rules defined in the file ./config/settings.js

### Step 6 - Run

* Run the checks, by running this cmd command (from within the folder):
```sh
npm start
```
