# Project Setup Guide

Welcome to the Salesforce App advanced project template! Follow these steps to get your environment ready and perform the initial deployment.

## 1. Prerequisites
- Node.js (LTS version recommended)
- npm
- Salesforce CLI (`sf`)
- GitHub account with access to the repository
- (macOS) Homebrew (for some install scripts)

## 2. Clone the Repository
```sh
git clone <your-repo-url>
cd advanced-project-template
```

## 3. Install Dependencies
```sh
npm install
```

Depending on the project (Sales Cloud or Service Cloud - please follow guides below)
## 4.1 Sales Cloud Configuration
**[Follow Sales Cloud configuration guide](docs/SALES-CLOUD-CONFIGURATION.md)**

## 4.2 Service Cloud Configuration
**[Follow Service Cloud configuration guide](Needs to be updated)**

## 5. Run Full Environment Setup
This will:
- Set up git hooks
- Link VS Code snippets
- Check Apex formatting prerequisites
- Generate SSL certificates
- Set up GitHub environments

```sh
npm run setup:full-env
```

## 6. Required GitHub Secrets & Variables

After running the setup script, you must manually add the following secrets and variables to your GitHub repository for each environment (CI, UAT, Production):

### Required Secrets
- **JWT_SERVER_KEY**: Private key for JWT authentication (PEM format, copy from `server.key`)
- **CONSUMER_KEY**: Salesforce Connected App Consumer Key (starts with `3MVG`)
- **DEPLOYMENT_USER**: Salesforce username for JWT authentication (e.g., `deploy@company.com.ci`)

Add these via GitHub → Settings → Secrets and variables → Actions → New repository secret. Example commands (using GitHub CLI):

```bash
cat certificates/server.key | gh secret set JWT_SERVER_KEY --env ci
cat certificates/server.key | gh secret set JWT_SERVER_KEY --env uat
cat certificates/server.key | gh secret set JWT_SERVER_KEY --env prod

gh secret set CONSUMER_KEY --body "3MVG9XXXXXXXXXXXXXXXXXXXXXXX" --env ci
gh secret set CONSUMER_KEY --body "3MVG9XXXXXXXXXXXXXXXXXXXXXXX" --env uat
gh secret set CONSUMER_KEY --body "3MVG9XXXXXXXXXXXXXXXXXXXXXXX" --env prod

gh secret set DEPLOYMENT_USER --body "deploy@company.com.ci" --env ci
gh secret set DEPLOYMENT_USER --body "deploy@company.com.uat" --env uat
gh secret set DEPLOYMENT_USER --body "deploy@company.com.prod" --env prod
```

### Required Variables
- **INSTANCE_URL**: Salesforce org URL for each environment (e.g., `https://company--ci.sandbox.my.salesforce.com`)
- **DEPLOYMENT_USER_MAP**: (Optional, advanced) JSON mapping of GitHub users to Salesforce users

Example:
```bash
gh variable set INSTANCE_URL --body "https://company--ci.sandbox.my.salesforce.com" --env ci
gh variable set INSTANCE_URL --body "https://company--uat.sandbox.my.salesforce.com" --env uat
gh variable set INSTANCE_URL --body "https://login.salesforce.com" --env prod
```

For more details and advanced configuration, see [docs/ENVIRONMENT-SETUP.md](ENVIRONMENT-SETUP.md).

## 7. Initial Deployment to Production
You can perform an initial deployment of the `force-app` source directly to production using the `init-setup` branch:

```sh
git checkout init-setup
# Authenticate to your production org (if not already authenticated)
sf org login web --set-default --alias prod
# Deploy to production
sf project deploy start --source-dir force-app --target-org prod --test-level RunLocalTests
```

> **Note:** Make sure you have the necessary permissions and your org is ready for deployment.

## 8. Next Steps
- Review the [NEW-DEVELOPER-SETUP.md](NEW-DEVELOPER-SETUP.md) for more developer onboarding details.
- You can view more details on [ENVIRONMENT-SETUP.md](ENVIRONMENT-SETUP.md) for environment variables and secrets.
- For code quality and testing, check [CODE-QUALITY.md](CODE-QUALITY.md) and [TESTING.md](TESTING.md).

---

For any issues, please refer to the documentation in the `` folder or contact the project maintainer.
