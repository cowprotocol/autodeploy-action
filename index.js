const core = require("@actions/core");
const { AutoDeployApi } = require("./autodeploy");

async function run() {
  let status;
  try {
    const pods = core.getInput("pods");
    const images = core.getInput("images");
    const tag = core.getInput("tag") || "develop";
    const url = core.getInput("url", { required: true });
    const token = core.getInput("token", { required: true });
    const timeout = parseInt(core.getInput("timeout") || 60000);

    core.info(`Re-deploying pods ${pods} for tag ${tag}`);
    const api = new AutoDeployApi(url, token, timeout);

    if (pods) {
      status = await api.redeploy("services", pods, tag);
    }
    if (images) {
      status = await api.redeploy("images", images, tag);
    }
    if(!pods && !images) {
      throw new Error("Specify either the pods or container image for which you want to trigger a redeploy.");
    }
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
