import loadPage, { getName } from '../src';
import nock from 'nock';
import path from 'path';
import { promises as fs } from 'fs';
import os from 'os';
import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';

axios.defaults.adapter = httpAdapter;

const getFixturesPath = (filename) => path.join('./__tests__/__fixtures__', filename);

const readFile = (filename) => fs.readFile(getFixturesPath(filename), 'utf-8');

test('change name test', () => {
  const pageAddress1 = 'https://hexlet.io/courses';
  const expectedName1 = 'hexlet-io-courses.html';
  expect(getName(pageAddress1)).toBe(expectedName1);
  const pageAddress2 = 'http://google.com/ian-proletov/';
  const expectedName2 = 'google-com-ian-proletov.html';
  expect(getName(pageAddress2)).toBe(expectedName2);
});

test('test downloading', async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  const expectedData = await readFile('page-actual.html');
  nock('https://proletov.com')
    .get('/page')
    .reply(200, expectedData);
  await loadPage('https://proletov.com/page', tmpDir);
  const actualData = await fs.readFile(path.join(tmpDir, 'proletov-com-page.html'), 'utf-8');
  expect(actualData).toBe(expectedData);
});
