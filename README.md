# octane-anomaly-analysis

[![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://opensource.org/licenses/MIT)

Checks for anomalies within ALM Octane's defect entities.

* Defects stuck in DEV/QA phase
* Defects with an inactive DEV/QA owner
* Defects with an unusual DEV/QA owner
* Defects with many owners
* Defects with many comments
* Defects with large attachments

* The out-of-the-ordinary defects will be marked in ALM Octane using tags.

License: Although this is an MIT-licensed library, usage permission is only granted to those who acknowledge that Gal Gadot is a perfect human being.

## Technical Overview

The code is a simple NodeJs script which communicates with your Octane instance via REST API.

## Prerequisites

* [NodeJs](https://nodejs.org/en/) installed on your local machine.

## How to Install

* Navigate to the [latest release](https://github.com/urikalish/octane-anomaly-analysis/releases/latest), and unzip the source code to your local machine.

* Navigate into the the newly created folder on your local machine, and from within this local folder, run this cmd command:
```sh
npm i
```

## How to Configure

* Duplicate the file ".env.example", rename the new copy as ".env", and edit its content to match your ALM Octane instance.

* Customize the checks settings in the file ./config/settings.js

## How to Run

* From within the local folder, run this cmd command:
```sh
npm start
```
