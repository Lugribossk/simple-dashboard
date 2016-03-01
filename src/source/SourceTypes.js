import DropwizardHealthcheck from "./DropwizardHealthcheck";
import GithubBranches from "./GithubBranches";
import Loggly from "./Loggly";
import Message from "./Message";
import RssAws from "./RssAws";
import StatusCode from "./StatusCode";
import StatusIo from "./StatusIo";
import DockerCloudService from "./DockerCloudService";
import VsoBranches from "./VsoBranches";
import VsoBuild from "./VsoBuild";

// Register all Source subclasses so they can be instantiated from the configuration.
export default [
    DockerCloudService,
    DropwizardHealthcheck,
    GithubBranches,
    Loggly,
    Message,
    RssAws,
    StatusCode,
    StatusIo,
    VsoBranches,
    VsoBuild
];