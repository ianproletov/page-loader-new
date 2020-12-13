import _ from 'lodash';

export default (pageAddress) => {
  const { host, pathname } = new URL(pageAddress);
  return `${host}${_.trimEnd(pathname, '/')}`.replace(/[./]/g, '-');
};
