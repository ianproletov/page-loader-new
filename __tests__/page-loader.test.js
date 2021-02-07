import nock from 'nock';
import path from 'path';
import { promises as fs } from 'fs';
import os from 'os';
import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import loadPage from '../src';

axios.defaults.adapter = httpAdapter;

const getFixturesPath = (filename) => path.join('./__tests__/__fixtures__', filename);

test('downloading', async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  const expectedData = await fs.readFile(getFixturesPath('page-expected.html'), 'utf-8');
  const beforeData = await fs.readFile(getFixturesPath('page-actual.html'), 'utf-8');
  const imageData = await fs.readFile(getFixturesPath('image.png'));
  const scriptData = await fs.readFile(getFixturesPath('application.txt'), 'utf-8');
  const styleData = await fs.readFile(getFixturesPath('style.css'), 'utf-8');
  const temporaryFilesDir = path.join(tmpDir, 'proletov-com-page_files');

  nock('https://proletov.com')
    .get('/page')
    .reply(200, beforeData)
    .get('/assets/image.png')
    .reply(200, imageData)
    .get('/assets/application.js')
    .reply(200, scriptData)
    .get('/assets/style.css')
    .reply(200, styleData);

  await loadPage('https://proletov.com/page', tmpDir);
  const actualData = await fs.readFile(path.join(tmpDir, 'proletov-com-page.html'), 'utf-8');
  expect(actualData).toBe(expectedData.trim());
  const receivedImageDataPath = path.join(temporaryFilesDir, 'assets-image.png');
  const receivedStyleDataPath = path.join(temporaryFilesDir, 'assets-style.css');
  const receivedScriptDataPath = path.join(temporaryFilesDir, 'assets-application.js');
  const receivedImageData = await fs.readFile(receivedImageDataPath);
  const receivedStyleData = await fs.readFile(receivedStyleDataPath);
  const receivedScriptData = await fs.readFile(receivedScriptDataPath);
  expect(receivedImageData.toString()).toBe(imageData.toString());
  expect(receivedStyleData.toString()).toBe(styleData.toString());
  expect(receivedScriptData.toString()).toBe(scriptData.toString());
});
