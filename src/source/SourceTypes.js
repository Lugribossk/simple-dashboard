import DropwizardHealthcheck from "./DropwizardHealthcheck";
import GithubBranches from "./GithubBranches";
import Message from "./Message";
import RssAws from "./RssAws";
import StatusCode from "./StatusCode";
import StatusIo from "./StatusIo";
import TutumService from "./TutumService";
import VsoBranches from "./VsoBranches";
import VsoBuild from "./VsoBuild";

// Register all Source subclasses so they can be instantiated from the configuration.
export default [
    DropwizardHealthcheck,
    GithubBranches,
    Message,
    RssAws,
    StatusCode,
    StatusIo,
    TutumService,
    VsoBranches,
    VsoBuild
];