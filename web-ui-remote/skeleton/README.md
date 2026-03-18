# React TypeScript Vite project

This repository contains a React Web UI application on Typescript based on Vite project created from web-ui-remote backstage template

## Documentation

### Build Pre-Requisites

### Install project Libraries (one time action after cloning the project)

``` yarn  install```

### Generate API Client based Open API Specification

The specification file expected in yaml format and placed under 'src/api/specs/' folder:

``` yarn  generate-api-client```

The generated command output will be located under src/api-client path.
NOTE: The '@openapitools/openapi-generator-cli' do not allow to generate multiple API clients in a single run, 
so if more than one API client is required for the project the package.json need to be updated with an additional script using generate-api-client as a sample.  

### Run the Vite application

To run the created application the following command can xbe used:

``` yarn vite ```

### Testing

To simplify project startup or changes testing there are number of resources (petstore api specification and UI pages created to invoke API client) under 'samples' folder.
The expected usage scenario for the sample files provided are the following:
* Start server on the port 8888 (with base URL like http://localhost:8888/api/v2) implementing the API accordingly to the petstore-api.yaml specification
* Copy files from sample folder to the corresponding location in project folder structure
* Run ``` yarn  generate-api-client``` to generate API client files
* Start the application using ``` yarn vite ```
* Hit the http://localhost:5173/ URL in the browser
* Generate access token in Backstage's API Token Generator for the environment server API was spined-up for
* Populate the Bearer Token field with the token generated in the previous step
* Call the API(s) you have implemented on your server API

