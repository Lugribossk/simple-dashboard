# simple-dashboard
[![Circle CI](https://circleci.com/gh/Lugribossk/simple-dashboard.svg?style=shield)](https://circleci.com/gh/Lugribossk/simple-dashboard)
[![Dependency Status](https://david-dm.org/Lugribossk/simple-dashboard.svg)](https://david-dm.org/Lugribossk/simple-dashboard)
[![devDependency Status](https://david-dm.org/Lugribossk/simple-dashboard/dev-status.svg)](https://david-dm.org/Lugribossk/simple-dashboard#info=devDependencies)

A straightforward dashboard for showing an overview of the status of servers and infrastructure.
Runs entirely in the browser as static Javascript so it can be hosted easily without needing to set up and maintain yet another server. 

![Example](/docs/example.jpg)

## Configuration
The dashboard is configured via a JSON config file that defines where to get status information from.

```json
{
    "title": "Infrastructure status",
    "sources": [{
        "type": "statusio",
        "title": "Docker",
        "link": "http://status.docker.com",
        "id": "533c6539221ae15e3f000031"
    }, {
        "type": "rss-aws",
        "title": "CloudFront",
        "id": "cloudfront"
    }, {
        "type": "rss-aws",
        "title": "EC2 US East",
        "id": "ec2-us-east-1"
    }, {
        "type": "dropwizard",
        "title": "Production - Healthcheck",
        "adminPath": "http://localhost:9090/admin"
    }]
}
```

Name|Description
---|---
title|Title to show at the top of the dashboard. Optional.
sources|List of status sources to show and their individual configurations.
panels|List of panels that split the screen

## Status sources

### General options
Options for all the status sources.

Name|Default|Description
---|---|---
type||Which kind of source this is, must be one of the types listed below, e.g. `status-code` or `vsts-branches`.
title||Title displayed on status indicator, e.g. `Production Healthcheck`.
interval|60|Number of seconds between status checks.

### Docker Cloud service
Status of a [Docker Cloud](https://cloud.docker.com/) (formerly Tutum) service.

Name|Default|Description
---|---|---
type||`docker-cloud-service`
id||Service ID.
username||Docker Cloud account username.
apiKey||Docker Cloud account API key.

### Dropwizard healthcheck
The status of a [Dropwizard](http://www.dropwizard.io) service's [health checks](http://www.dropwizard.io/manual/core.html#health-checks).

By default Dropwizard is not set up to allow cross-origin requests, so you will have to add a servlet filter to the admin port that does this.
TODO example.

Name|Default|Description
---|---|---
type||`dropwizard`
adminPath||Path to the admin port for your service, e.g. `http://localhost:8081` for a local server with the default admin settings.

### GitHub branches
All the branches of a GitHub repository. Also shows any open pull requests from those branches to master.

Can also show the [status](https://developer.github.com/v3/repos/statuses/) of the latest commit in each branch.
This is set by many build system that integrate with GitHub such as CircleCI.

Name|Default|Description
---|---|---
type||`github-branches`
owner||Repository owner name, i.e. the user or organization the repo is located under.
repo||Repository name.
token||Personal access token.
showStatus|false|Also show build status. The build status is only set if an external system pushes it to Github, e.g. as part of a continuous integration setup with Travis or CircleCI.

### Loggly
Number of WARN and ERROR log messages in [Loggly](http://www.loggly.com).

Name|Default|Description
---|---|---
type||`loggly`
username||Username.
password||Password.
account||Account name, from the Loggly URL.
tag||A tag to filter by, e.g. to separate logs from different environments.
from|`-24h`|Count log messages newer than this.


### Static message
A static message.

Name|Default|Description
---|---|---
type||`message`
status|success|How the status indicator should look, either `success`, `warning`, `danger` or `info`.
message||Message to display.

### Amazon Web Services status
One of the statuses from Amazon Web Services' [Service Health Dashboard](http://status.aws.amazon.com/).

Name|Default|Description
---|---|---
type||`rss-aws`
id||ID of the status feed to follow as seen in the RSS link, e.g. `ec2-us-east-1`.

### Response status code
Whether an arbitrary URL returned a successful status code. Any status code below 400 counts as successful.

Make sure that the server is set up to allow cross-origin requests.

Name|Default|Description
---|---|---
type||`status-code`
url||URL to request and check response status code for.
link|url|Link when clicking on the status indicator.

### Status.io
Status from a service dashboard hosted by [Status.io](http://status.io). Many web services use this for their status pages.

Name|Default|Description
---|---|---
type||`statusio`
id||Status.io's ID for the service you want to check, e.g. `533c6539221ae15e3f000031` for Docker. There doesn't seem to be an easy way to find this yourself, but you can probably get it by asking customer support for the service you want to check.
link||Link to the service's status page, e.g. `https://status.docker.com`.

### Visual Studio Team Services branches
Build status of the latest commit for all the branches in a Visual Studio Team Services Git repository. Also shows highlights branches with an open pull request to master.

Name|Default|Description
---|---|---
type||`vsts-branches`
repoId|ID of the repository, can be found in the URL in the control panel under Version Control.
account|Account subdomain.
project|Project name.
token|[Personal Access Token](https://www.visualstudio.com/en-us/get-started/setup/use-personal-access-tokens-to-authenticate).

### Visual Studio Team Services build
Build status of the latest commit for a single branch in a Visual Studio Team Services Git repository.

Name|Default|Description
---|---|---
type||`vsts-build`
branch|master|Branch to show status for.
definition||Name of the build definition to show status for.
account|
project|
token|



## Complications

### Credentials

If you put secrets such as Github tokens in the configuration file, then you should either encrupt the secret or only upload the dashboard to a non-public site.

Values can be encrypted with `window.encrypt("password", "value")` which should then be placed in config.json as e.g. `{"token": {"encrypted": "..."}}`

### Cross-origin requests

TODO


## Setup
- Install NodeJS
- `npm install -g grunt-cli`
- `npm install`

## Development
- `grunt dev`
- Open `localhost:8080`
- The development configuration file will be loaded directly from `src/config.json`

### Adding new source types

1. Create a new subclass of `Source` that overrides `getStatus()`.
2. Define its type in the configuration file by adding it as a static property on your subclass named `type`. 
3. Add it to the list in `SourceTypes`.

## Building
- `grunt build`
- The files in `target/dist` can then be placed on a server. The real config.json configuration file you want to use should be placed next to index.html.