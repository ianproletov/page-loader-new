import loader from '../src';

test('main test', () => {
  const expected = loader();
  expect(false).toBe(expected);
});
