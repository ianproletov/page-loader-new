import nock from 'nock';
import path from 'path';
import { promises as fs } from 'fs';
import os from 'os';
import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import loadPage from '../src';

axios.defaults.adapter = httpAdapter;

const getFixturesPath = (filename) => path.join('./__tests__/__fixtures__', filename);

const readFile = (filename) => fs.readFile(getFixturesPath(filename), 'utf-8');

let tmpDir;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

test('transform image link', async () => {
  const expectedData = await readFile('page-expected.html');
  const beforeData = await readFile('page-actual.html');
  const imageData = await fs.readFile(getFixturesPath('image.png'));
  nock('https://proletov.com')
    .get('/page')
    .reply(200, beforeData)
    .get('/assets/image.png')
    .reply(200, imageData);
  await loadPage('https://proletov.com/page', tmpDir);
  const actualData = await fs.readFile(path.join(tmpDir, 'proletov-com-page.html'), 'utf-8');
  expect(actualData).toBe(expectedData);
  const receivedImageDataPath = path.join(tmpDir, 'proletov-com-page_files', 'assets-image.png');
  const receivedImageData = await fs.readFile(receivedImageDataPath);
  expect(receivedImageData.toString()).toBe(imageData.toString());
});
