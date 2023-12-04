# Auto-Deploy Action

An action to automatically trigger a re-deployment of Kubernetes pods.

## Configuration

Just configure secrets for the URL and API token as well as which deployment pods should be automatically restarted:

```yaml
uses: cowprotocol/autodeploy-action@v1
with:
  pods: foo,bar
  url: ${{ secret.AUTODEPLOY_URL }}
  token: ${{ secrets.AUTODEPLOY_TOKEN }}
```

alternatively you can trigger restarts by image name (all deployments running that image will restart)

```yaml
uses: cowprotocol/autodeploy-action@v1
with:
  images: ghcr.io/cowprotocol/services:main
  url: ${{ secret.AUTODEPLOY_URL }}
  token: ${{ secrets.AUTODEPLOY_TOKEN }}
```

In case the rollout process takes a long time, you may have to set a custom timeout

```yaml
timeout: 600000 # 10 minutes
```
