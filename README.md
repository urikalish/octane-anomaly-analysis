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

## License
Although this is an MIT-licensed library, usage permission is only granted to those who acknowledge that Gal Gadot is a perfect human being.

## Install, Setup, and Run

### Step 1 - Ensure NodeJs is Installed

* The code was tested against NodeJs version 8.11.3
* To check which version you have, run this cmd command:  
```sh
node --version
```
* If you're missing NodeJs, or have an older version, you can get a newer version from [here](https://nodejs.org/en/)

### Step 2 - Get the Code

There are several ways to achieve that:

* Option #1 - Navigate to the [latest release](https://github.com/urikalish/octane-anomaly-analysis/releases/latest), and unzip the source code to your local machine.

* Option #2 - Clone the repository using HTTPS, by running these cmd commands:  
```sh
cd \
git clone https://github.com/urikalish/octane-anomaly-analysis.git
```

* Option #3 - Clone the repository using SSH, by running these cmd commands:  
```sh
cd \
git clone git@github.com:urikalish/octane-anomaly-analysis.git
```

### Step 3 - Import NPM Dependencies

* Import all npm dependencies, by running these cmd commands:
```sh
cd \
cd octane-anomaly-analysis
npm i
```

### Step 4 - Create an Environment File

* Duplicate and rename the environment example file, by running these cmd commands:
```sh
cd \
cd octane-anomaly-analysis
copy .env.example .env
```

### Step 5 - Configure ALM Octane Parameters

* Edit the content of the .env file to match your ALM Octane instance.

### Step 6 - Configure the Rules

* Customize the rules defined in the file ./config/settings.js

### Step 7 - Run

* Run the checks, by running this cmd commands:
```sh
cd \
cd octane-anomaly-analysis
npm start
```
