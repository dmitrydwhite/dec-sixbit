import { exec } from "node:child_process";

function execProm(command) {
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      console.log("err", err);
      console.log("stdout", stdout);
      console.log("stderr", stderr);

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

    const versionStr = await execProm("npm version patch");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

runDeploy();
