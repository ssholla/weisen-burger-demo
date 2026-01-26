const core = require('@actions/core');
const axios = require('axios');

async function run() {
  try {
    const jiraUrl = core.getInput('jira_url');
    const username = core.getInput('jira_username');
    const apiToken = core.getInput('jira_api_token');
    const issueKeys = core.getInput('issue_keys').split(',');
    const invalidStatuses = core.getInput('jira_invalid_statuses').split(',').map(s => s.trim());

    const auth = Buffer.from(`${username}:${apiToken}`).toString('base64');

    let hasInvalidStatus = false;
    let statusSummary = '';

    for (const issueKey of issueKeys) {
      const trimmedIssueKey = issueKey.trim();
      console.log(`Checking status of Jira issue: ${trimmedIssueKey}`);

      try {
        const response = await axios.get(`${jiraUrl}/rest/api/3/issue/${trimmedIssueKey}`, {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/json'
          }
        });

        const status = response.data.fields.status.name;
        const isInvalid = invalidStatuses.includes(status);
        const statusMessage = `Issue ${trimmedIssueKey} status: ${status} - ${isInvalid ? 'INVALID' : 'VALID'}`;
        console.log(statusMessage);
        statusSummary += statusMessage + '\n';

        if (isInvalid) {
          hasInvalidStatus = true;
        }

      } catch (error) {
        if (error.response && error.response.status === 404) {
          const errorMessage = `Issue ${trimmedIssueKey} not found (404).`;
          console.error(errorMessage);
          statusSummary += errorMessage + '\n';
        } else {
          const errorMessage = `Error checking issue ${trimmedIssueKey}: ${error.message}`;
          console.error(errorMessage);
          statusSummary += errorMessage + '\n';
        }
      }
    }

    core.setOutput('invalid_validation_status', hasInvalidStatus.toString());
    core.setOutput('status_summary', statusSummary.trim());

  } catch (error) {
    core.setFailed(`Action failed: ${error.message}`);
  }
}

run();
