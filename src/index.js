import _ from 'lodash';

export default (pageAddress) => {
  const { host, pathname } = new URL(pageAddress);
  const changed = `${host}${_.trimEnd(pathname, '/')}`.replace(/\W/g, '-');
  return `${changed}.html`;
};
