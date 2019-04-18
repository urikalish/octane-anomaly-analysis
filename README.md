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

* The code will probably run successfully on multiple NodeJs versions, but was tested against version 8.11.3

* If you're missing NodeJs, you can get it [here](https://nodejs.org/en/)

## How to Install

* Browse to the [latest release](https://github.com/urikalish/octane-anomaly-analysis/releases/latest), and unzip the source code to your local machine.

* Navigate to the local root folder, and run this batch command:
```sh
install
```

## How to Configure

* Edit the content of the .env file to match your ALM Octane instance.

* Customize the rules defined in the .settings.js file to match your needs.

## How to Run

* Set the updateOctane flag in the file .settings.js to either true or false (for real or debug run). 

* Navigate to the root folder, and run this batch command:
```sh
npm start
```

## How to Add An Additional Check

* Edit the file ./checks/defect-my-rule.js according to your needs.

* Edit the corresponding entry at the end of the file .settings.js
