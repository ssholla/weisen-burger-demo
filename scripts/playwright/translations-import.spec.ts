import { test, expect } from '@playwright/test';
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
import path from 'path';

let execEnv = { env: { ...process.env, FORCE_COLOR: "0" } };

test('open Translation Workbench Import in Setup and upload STF file', async ({ page }) => {
  console.log(test.info().title);
  const OrgName = process.env.ORG_NAME || (await exec('sf org display --json', execEnv).then(r => JSON.parse(r.stdout.slice(r.stdout.indexOf('{'))).result.username));

  try {
    const result = await exec(`sf org display --json -o ` + OrgName, execEnv);
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

  await page.getByRole('button', { name: 'Setup' }).click();
  const setupPagePromise = page.waitForEvent('popup');
  await page.getByRole('menuitem', { name: 'Setup Opens in a new tab', exact: true }).click();
  const setupPage = await setupPagePromise;

  const searchbox = setupPage.getByRole('searchbox', { name: 'Quick Find' });
  await searchbox.click();
  await searchbox.fill('');
  await searchbox.type('Translation Workbench', { delay: 100 });
  await setupPage.getByRole('link', { name: 'Import', exact: true }).click();

  const frame = setupPage.frameLocator('iframe');

  const fileInput = frame.locator('#tip\\:theForm\\:importUploadBlock\\:step3\\:fileInput');
  await expect(fileInput).toBeVisible({ timeout: 10000 });

  const filePath = path.resolve('translation/translations.stf');
  await fileInput.setInputFiles(filePath);
  console.log('📄 File selected:', filePath);

  const importButton = frame.getByRole('button', { name: /Import/i });
  await expect(importButton).toBeVisible({ timeout: 10000 });
  await importButton.click();
  console.log('✅ Import button clicked');

  await expect(frame.locator('text=Your import request is being processed')).toBeVisible({ timeout: 10000 });
  console.log('✅ Import request submitted successfully. You’ll receive an email when it’s done.');
});
