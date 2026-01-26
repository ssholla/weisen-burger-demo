import { test, expect } from '@playwright/test';
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

let execEnv = { env: { ...process.env, FORCE_COLOR: "0" } };

test('salesforce-setting-update', async ({ page }) => {
  console.log(test.info().title);
  const OrgName = process.env.ORG_NAME || (await exec('sf org display --json', execEnv).then(r => JSON.parse(r.stdout.slice(r.stdout.indexOf('{'))).result.username));

  try {
    const result = await exec(`sf org display --json -o ${OrgName}`, execEnv);
    const jsonStart = result.stdout.indexOf('{');
    const cleanJson = result.stdout.slice(jsonStart).trim();
    const orgInfo = JSON.parse(cleanJson);

    const sid = orgInfo.result.accessToken;
    const instanceUrl = orgInfo.result.instanceUrl;
    const loginUrl = `${instanceUrl}/secur/frontdoor.jsp?sid=${encodeURIComponent(sid)}&retURL=${encodeURIComponent('/lightning/page/home')}`;

    await page.goto(loginUrl, { waitUntil: 'domcontentloaded' });
    console.log('✅ Logged into Salesforce Lightning');
  } catch (error) {
    console.error('❌ Error logging in:', error.message);
    return;
  }

  try {
    await page.getByRole('button', { name: 'Setup' }).click();
    const page3Promise = page.waitForEvent('popup');
    await page.getByRole('menuitem', { name: 'Setup Opens in a new tab', exact: true }).click();
    const page3 = await page3Promise;
    const searchbox = page3.getByRole('searchbox', { name: 'Quick Find' });
    await searchbox.click();
    await searchbox.fill('');
    await searchbox.type('session', { delay: 100 });

    const sessionLink = page3.getByRole('link', { name: 'Session Settings' });
    await expect(sessionLink).toBeVisible({ timeout: 10000 });
    await sessionLink.click();

    const frameLocator = page3.frameLocator('iframe');
    const checkbox = frameLocator.getByRole('checkbox', { name: /Enable secure and persistent/i });
    await expect(checkbox).toBeVisible({ timeout: 10000 });

    if (await checkbox.isChecked()) {
      console.log('☑ Checkbox is checked — unchecking it...');
      await checkbox.uncheck();
    } else {
      console.log('☐ Checkbox is already unchecked.');
    }

    await expect(checkbox).not.toBeChecked();
    console.log('✅ Assertion passed: Checkbox is unchecked.');

    const saveButton = frameLocator.getByRole('button', { name: 'Save' });
    await expect(saveButton).toBeVisible({ timeout: 10000 });
    await saveButton.click();

    console.log('✅ Session settings updated successfully.');
  } catch (error) {
    console.error('❌ Error during session settings update:', error.message);
  }
});
