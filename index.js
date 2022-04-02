const core = require("@actions/core");
const { AutoDeployApi } = require("./autodeploy");

async function run() {
  let status;
  try {
    const pods = core.getInput("pods", { required: true });
    const tag = core.getInput("tag") || "develop";
    const url = core.getInput("url", { required: true });
    const token = core.getInput("token", { required: true });

    core.info(`Re-deploying pods ${pods} for tag ${tag}`);
    const api = new AutoDeployApi(url, token);
    status = await api.redeploy(pods, tag);
  } catch (error) {
    status = error.status;
    core.setFailed(error.message);
  }

  if (typeof (status) === "number") {
    core.info(`Received status code ${status}`);
    core.setOutput("status_code", status);
  }
}

run();
