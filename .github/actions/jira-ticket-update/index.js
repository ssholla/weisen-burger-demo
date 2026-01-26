const core = require('@actions/core');
const axios = require('axios');

async function run() {
  try {
    const jiraUrl = core.getInput('jira_url');
    const username = core.getInput('jira_username');
    const apiToken = core.getInput('jira_api_token');
    const issueKeys = core.getInput('issue_keys').split(',');
    const statusName = core.getInput('status_name');

    const auth = Buffer.from(`${username}:${apiToken}`).toString('base64');

    for (const issueKey of issueKeys) {
      const trimmedIssueKey = issueKey.trim();
      console.log(`Checking if Jira issue exists: ${trimmedIssueKey}`);

      try {
        await axios.get(`${jiraUrl}/rest/api/3/issue/${trimmedIssueKey}`, {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/json'
          }
        });

        console.log(`Updating Jira issue: ${trimmedIssueKey}`);

        const transitionsRes = await axios.get(`${jiraUrl}/rest/api/3/issue/${trimmedIssueKey}/transitions`, {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/json'
          }
        });

        const transitions = transitionsRes.data.transitions;
        const targetTransition = transitions.find(t => t.name.toLowerCase() === statusName.toLowerCase());

        if (!targetTransition) {
          throw new Error(`No transition found for status "${statusName}" on issue "${trimmedIssueKey}"`);
        }

        await axios.post(`${jiraUrl}/rest/api/3/issue/${trimmedIssueKey}/transitions`, {
          transition: { id: targetTransition.id }
        }, {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/json'
          }
        });

        console.log(`Issue ${trimmedIssueKey} updated to ${statusName}`);

      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.error(`Issue ${trimmedIssueKey} not found (404). Skipping...`);
        } else {
          console.error(`Error updating issue ${trimmedIssueKey}: ${error.message}`);
        }
      }
    }

  } catch (error) {
    core.setFailed(`Action failed: ${error.message}`);
  }
}

run();