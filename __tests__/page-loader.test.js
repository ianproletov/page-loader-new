import loader from '../src';

test('main test', () => {
  const expected = loader();
  expect(true).toBe(expected);
});
