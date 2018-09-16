# octane-anomaly-analysis

[![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://opensource.org/licenses/MIT)

Checks for anomalies within ALM Octane's defect entities.

* Defects with an inactive owner
* Defects with an inactive QA owner
* Defects with large attachments
* Defects with many comments
* Defects with many owners
* Defects stuck in DEV phase
* Defects stuck in QA phase
* Defects with an unusual owner
* Defects with an unusual QA owner

* The out-of-the-ordinary defects will be tagged in Octane for easy filter or group-by.

## Technical Overview

The code is a simple NodeJs script which communicates with your Octane instance via REST API.

## Prerequisites

* [NodeJs](https://nodejs.org/en/) installed on your local machine.

## How to Install

* Unzip the [code](https://github.com/urikalish/octane-anomaly-analysis/archive/v1.0.0.zip) to your local machine.

* Navigate into the the newly created folder on your local machine. 

* From within this local folder, run this cmd command:
```sh
npm i
```

## How to Configure

* Configure your Octane server details in the file ./config/environment.js

* Customize the checks settings in the file ./config/settings.js

## How to Run

* From within the local folder, run this cmd command:
```sh
npm start
```
