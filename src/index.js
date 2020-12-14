import _ from 'lodash';
import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';
import cheerio from 'cheerio';
import url from 'url';

const types = {
  main: (pageAddress) => {
    const { host, pathname } = url.parse(pageAddress);
    return `${host}${_.trimEnd(pathname, '/')}`.replace(/\W/g, '-');
  },
  file: (pageAddress) => `${types.main(pageAddress)}.html`,
  link: (pageAddress) => {
    const { dir, name, ext } = path.parse(pageAddress);
    return `${_.trimStart(path.join(dir, name), '/')}`.replace(/\W/g, '-').concat(`${ext}`);
  },
  dir: (pageAddress) => `${types.main(pageAddress)}_files`,
};

const getName = (pageAddress, type) => types[type](pageAddress);

export default (pageAddress, outputPath) => {
  const linkDir = getName(pageAddress, 'dir');
  const loadedLinks = [];
  return axios.get(pageAddress)
    .then(({ data }) => {
      const filename = getName(pageAddress, 'file');
      const filepath = path.join(outputPath, filename);
      const $ = cheerio.load(data);
      $('base').remove();
      $('img').each((index, currentTag) => {
        const link = $('img').attr('src');
        if (link && !url.parse(link).host) {
          const linkName = getName(link, 'link');
          const linkPath = path.join(linkDir, linkName);
          loadedLinks.push(link);
          $(currentTag).attr('src', linkPath);
        }
      });
      fs.mkdir(path.join(outputPath, linkDir));
      return fs.writeFile(filepath, $.html());
    })
    .then(() => {
      const promises = loadedLinks.map((link) => axios.get(url.resolve(pageAddress, link), { responseType: 'arraybuffer' })
        .then(({ data }) => {
          const linkName = getName(link, 'link');
          const linkPath = path.join(linkDir, linkName);
          const absoluteLinkPath = path.join(outputPath, linkPath);
          return fs.writeFile(absoluteLinkPath, data);
        }));
      return Promise.all(promises);
    });
};
