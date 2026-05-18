// const { gitDescribeSync } = require('git-describe');
import gitCommitInfo from "git-commit-info";
import { writeFileSync } from "fs";
import info from "./package.json" with { type: "json" };

// const gitInfo = gitDescribeSync();
const gitInfo = gitCommitInfo();
gitInfo.version = `v${info.version}-${new Date().toISOString().substring(0, 16).replace(":", "")}-${gitInfo.shortHash}`;
gitInfo.imageversion = `v${info.version}-${gitInfo.shortHash}`;
gitInfo.author = "";
const versionInfoJson = JSON.stringify(gitInfo, null, 2);

writeFileSync("git-version.json", versionInfoJson);
