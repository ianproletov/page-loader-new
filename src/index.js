import _ from 'lodash';
import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';

export const getName = (pageAddress) => {
  const { host, pathname } = new URL(pageAddress);
  const changed = `${host}${_.trimEnd(pathname, '/')}`.replace(/\W/g, '-');
  return `${changed}.html`;
};

const loadPage = (pageAddress, outputPath) => axios.get(pageAddress)
  .then(({ data }) => {
    const filename = getName(pageAddress);
    const filepath = path.join(outputPath, filename);
    return fs.writeFile(filepath, data.toString());
  });

export default loadPage;
