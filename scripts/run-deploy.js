import { exec, spawn } from "node:child_process";

function execProm(command) {
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (!err) {
        return resolve(stdout);
      } else {
        return reject(stderr);
      }
    });
  });
}

async function runDeploy() {
  try {
    const currentBranch = await execProm("git rev-parse --abbrev-ref HEAD");

    if (currentBranch.trim() !== "main") {
      throw new Error(
        "It's too dangerous to deploy from a branch other than main!",
      );
    }

    const branchNotClean = await execProm("git status --porcelain");

    if (branchNotClean) {
      throw new Error(
        "The branch is not in a clean state; resolve or stash changes before publishing!",
      );
    }

    const vString = await execProm("npm version patch");

    console.log("Version updated to " + vString);
    console.log(
      "Double check your npmrc file (using nphome) and publish to NPM!",
    );
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

runDeploy().then(() => {
  spawn("npm", ["publish"]);
});
