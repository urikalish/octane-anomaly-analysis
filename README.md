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

## Prerequisites

* [NodeJs](https://nodejs.org/en/) installed on the local machine.

## How to Install

* Clone the GitHub repository to a local directory (e.g. c:\octane-anomaly-analysis\)

* Change directory to the newly created folder 
```sh
cd c:\octane-anomaly-analysis
```
* Import npm dependencies
```sh
npm i
```

## How to Configure

* Configure environment details in ./config/environment.js

* Configure settings in ./config/settings.js

## How to Run
```sh
npm start
```
