import _ from 'lodash';
import axios from 'axios';
import { promises as fs } from 'fs';
import debug from 'debug';
import Listr from 'listr';
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

const tags = {
  script: 'src',
  link: 'href',
  img: 'src',
};

const loadLog = debug('page-loader:download');
const getLog = debug('page-loader:get');
const createLog = debug('page-loader:create');

const getName = (pageAddress, type) => types[type](pageAddress);

export default (pageAddress, outputPath) => {
  const linkDir = getName(pageAddress, 'dir');
  const loadedLinks = [];
  const filename = getName(pageAddress, 'file');
  const filepath = path.join(outputPath, filename);
  let htmlData;
  return axios.get(pageAddress)
    .then(({ data }) => {
      getLog('response from', pageAddress);
      loadLog('to', outputPath);
      const $ = cheerio.load(data);
      $('base').remove();
      const goalTags = Object.keys(tags);
      goalTags.forEach((tag) => {
        const attribute = tags[tag];
        $(tag).each((index, currentTag) => {
          const link = $(tag).attr(attribute);
          if (link && !url.parse(link).host) {
            const linkName = getName(link, 'link');
            const linkPath = path.join(linkDir, linkName);
            loadedLinks.push(link);
            $(currentTag).attr(attribute, linkPath);
            getLog('link', link);
          }
        });
      });
      htmlData = $.html();
      createLog('directory for downloading page content: ', path.join(outputPath, linkDir));
      return fs.mkdir(path.join(outputPath, linkDir));
    })
    .then(() => {
      const tasks = new Listr(loadedLinks.map((link) => ({
        title: `downloading ${link}`,
        task: () => axios.get(url.resolve(pageAddress, link), { responseType: 'arraybuffer' })
          .then(({ data }) => {
            const linkName = getName(link, 'link');
            const linkPath = path.join(linkDir, linkName);
            const absoluteLinkPath = path.join(outputPath, linkPath);
            loadLog(`${link} content to ${absoluteLinkPath}`);
            return fs.writeFile(absoluteLinkPath, data);
          }),
      })), { concurrent: true });
      return tasks.run();
    })
    .then(() => {
      loadLog('page to: ', filepath);
      return fs.writeFile(filepath, htmlData);
    })
    .catch((error) => {
      const message = `The error occured: ${error.message}`;
      throw new Error(message);
    });
};
