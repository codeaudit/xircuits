import { test, type Page, expect } from '@playwright/test';
import { navigateThroughJupyterDirectories, compileAndRunXircuits, NodeConnection, connectNodes, UpdateLiteralNode, updateLiteral } from '../xircuits_test_utils'
import { datatype_test_1, datatype_test_2 } from './expected_outputs/01_datatypes'


test.describe.configure({ mode: 'serial' });

let page: Page;

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
});

test.afterAll(async () => {
  await page.close();
});


test('Init data type test', async ({ page, browserName }) => {

  await page.goto('http://localhost:8888');
  await page.locator('[aria-label="File\\ Browser\\ Section"] >> text=xai_components').dblclick();
  await page.locator('[aria-label="File\\ Browser\\ Section"] >> text=xai_tests').dblclick();
  await page.locator('[aria-label="File\\ Browser\\ Section"] >> text=DataTypes.xircuits').click();
  await page.keyboard.press('Control+C');
  await page.locator(`[aria-label="File\\ Browser\\ Section"] >> text=${browserName}`).dblclick();
  await page.locator('.jp-DirListing-content').click({ button: 'right' });
  await page.getByText("Ctrl+V").click();
});


test('Test connecting nodes', async ({ page, browserName }) => {

  await page.goto(`http://localhost:8888/`);
  await navigateThroughJupyterDirectories(page, `http://localhost:8888/lab/tree/xai_components/xai_tests/${browserName}/DataTypes.xircuits`);

  const nodeConnections: NodeConnection[] = [
    { sourceNode: "Literal String",   sourcePort: "out-0", targetNode: "AllLiteralTypes", targetPort: "parameter-string-string_port" },
    { sourceNode: "Literal Integer",  sourcePort: "out-0", targetNode: "AllLiteralTypes", targetPort: "parameter-int-int_port" },
    { sourceNode: "Literal Float",    sourcePort: "out-0", targetNode: "AllLiteralTypes", targetPort: "parameter-float-float_port" },
    { sourceNode: "Literal Boolean",  sourcePort: "out-0", targetNode: "AllLiteralTypes", targetPort: "parameter-boolean-boolean_port" },
    { sourceNode: "Literal List",     sourcePort: "out-0", targetNode: "AllLiteralTypes", targetPort: "parameter-list-list_port" },
    { sourceNode: "Literal Tuple",    sourcePort: "out-0", targetNode: "AllLiteralTypes", targetPort: "parameter-tuple-tuple_port" },
    { sourceNode: "Literal Dict",     sourcePort: "out-0", targetNode: "AllLiteralTypes", targetPort: "parameter-dict-dict_port" },
    { sourceNode: "Literal Secret",   sourcePort: "out-0", targetNode: "AllLiteralTypes", targetPort: "parameter-secret-secret_port" },
    { sourceNode: "Literal Chat",     sourcePort: "out-0", targetNode: "AllLiteralTypes", targetPort: "parameter-chat-chat_port" },
    { sourceNode: "Start",            sourcePort: "out-0", targetNode: "AllLiteralTypes", targetPort: "in-0" },
    { sourceNode: "AllLiteralTypes",  sourcePort: "out-0", targetNode: "Finish",          targetPort: "in-0" }
  ];
  
  for (const connection of nodeConnections) {
    await connectNodes(page, connection);
  }

  await compileAndRunXircuits(page);

  const content = await page.locator('.jp-OutputArea-output').innerText();
  expect(content).toContain(datatype_test_1);
  await page.locator('li[data-id="xircuit-output-panel"] >> svg[data-icon="ui-components:close"]').click();
});


test('Test editing literal nodes', async ({ page, browserName }) => {

  await page.goto(`http://localhost:8888/`);
  await navigateThroughJupyterDirectories(page, `http://localhost:8888/lab/tree/xai_components/xai_tests/${browserName}/DataTypes.xircuits`);

  const updateParamsList = [
    { type: "Literal String",   updateValue: "Updated String" },
    { type: "Literal Integer",  updateValue: "456" },
    { type: "Literal Float",    updateValue: "4.56" },
    { type: "Literal Boolean",  updateValue: false },
    { type: "Literal List",     updateValue: '"d", "e", "f"' },
    { type: "Literal Tuple",    updateValue: '"g", "h", "i"' },
    { type: "Literal Dict",     updateValue: '"x": "xenon", "y": "yellow", "z": 2023' },
    { type: "Literal Secret",   updateValue: "def", expectedText: '*****' },
  ];
  
  for (const params of updateParamsList) {
    const { type, updateValue, expectedText } = params;
    await updateLiteral(page, { type, updateValue });
    const visibleText = expectedText ? expectedText : (typeof updateValue === "boolean" ? (updateValue ? "True" : "False") : String(updateValue));
    await expect(page.getByText(visibleText)).toBeVisible();
  }

  await page.getByText('Literal Chat').dblclick();
  await page.locator('div').filter({ hasText: /^Select a rolesystemuserassistantfunctionRemovedef$/ }).getByRole('button').click();
  await page.locator('select[name="role"]').selectOption('user');
  await page.locator('select[name="role"]').click();
  await page.getByText('abc', { exact: true }).fill('updated user message');
  await page.getByRole('button', { name: 'Add Message' }).click();
  await page.getByRole('combobox').nth(2).selectOption('assistant');
  await page.getByRole('textbox').nth(2).click();
  await page.getByRole('textbox').nth(2).fill('new assistant message');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByText('False')).toBeVisible();

  await compileAndRunXircuits(page);

  const updated_content = await page.locator('.jp-OutputArea-output').innerText();
  expect(updated_content).toContain(datatype_test_2);
});