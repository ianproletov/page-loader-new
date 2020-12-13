import { getName } from '../src';

test('change name test', () => {
  const pageAddress1 = 'https://hexlet.io/courses';
  const expectedName1 = 'hexlet-io-courses.html';
  expect(getName(pageAddress1)).toBe(expectedName1);
  const pageAddress2 = 'http://google.com/ian-proletov/';
  const expectedName2 = 'google-com-ian-proletov.html';
  expect(getName(pageAddress2)).toBe(expectedName2);
});
