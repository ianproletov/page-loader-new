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

test('testdownloading', async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  const expectedData = await readFile('page-actual.html');
  nock('https://proletov.com')
    .get('/page')
    .reply(200, expectedData);
  await loadPage('https://proletov.com/page', tmpDir);
  const actualData = await fs.readFile(path.join(tmpDir, 'proletov-com-page.html'), 'utf-8');
  expect(actualData).toBe(expectedData);
});
