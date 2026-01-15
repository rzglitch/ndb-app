const cheerio = require('cheerio');
const fs = require('fs').promises;
const _ = require('lodash');

const compile = async (path, data) => {
  const html = await fs.readFile(`views/${path}.t.html`);
  const $ = cheerio.load(html);

  $('[x-for]').each(function () {
    const key = $(this).attr('x-for').split(' in ')[1].slice(5); // Remove 'data.' from the start
    const items = _.get(data, key);
    const template = $(this).html();

    let result = '';
    items.forEach((item) => {
      let itemHtml = cheerio.load(template);
      for (const prop in item) {
        const regex = new RegExp(`item.${prop}`, 'g');
        itemHtml('[x-html]').each(function () {
          if ($(this).attr('x-html') === `item.${prop}`) {
            $(this).html(item[prop]);
          }
        });
        itemHtml('[x-text]').each(function () {
          if ($(this).attr('x-text') === `item.${prop}`) {
            $(this).text(item[prop]);
            $(this).removeAttr('x-text');
          }
        });
        itemHtml('[:src]').each(function () {
          if ($(this).attr(':src') === `item.${prop}`) {
            $(this).attr('src', item[prop]);
            $(this).removeAttr(':src');
          }
        });
        itemHtml('[:id]').each(function () {
          if ($(this).attr(':id') === `item.${prop}`) {
            $(this).attr('id', item[prop]);
            $(this).removeAttr(':id');
          }
        });
        itemHtml('[:href-s]').each(function () {
          const href = $(this).attr(':href-s');
          const regex = /\{(.*?)\}/g;
          const parse = [...href.matchAll(regex)].map(f => f[1]);

          if (parse) {
            for (let s of parse) {
              if (s === `item.${prop}`) {
                const f = item[prop];
                if ($(this).attr('href')) {
                  const currentHref = $(this).attr('href');
                  $(this).attr('href', currentHref.replace(`{item.${prop}}`, f));
                } else {
                  $(this).attr('href', href.replace(`{item.${prop}}`, f));
                }
              }
            }
          }
        });
      }
      result += itemHtml.html();
    });

    $(this).replaceWith(result);
  });

  $('[x-html]').each(function () {
    const key = $(this).attr('x-html').slice(5); // Remove 'data.' from the start
    const value = _.get(data, key);
    if (value) {
      $(this).html(value);
    }
  });

  $('[x-text]').each(function () {
    const key = $(this).attr('x-text').slice(5); // Remove 'data.' from the start
    const value = _.get(data, key);
    if (value) {
      $(this).text(value);
    }
  });

  $('[:src]').each(function () {
    const key = $(this).attr(':src').slice(5); // Remove 'data.' from the start
    const value = _.get(data, key);
    if (value) {
      $(this).attr('src', value);
    }
  });

  $('[:id]').each(function () {
    const key = $(this).attr(':id').slice(5); // Remove 'data.' from the start
    const value = _.get(data, key);
    if (value) {
      $(this).attr('id', value);
    }
  });

  $('[:href]').each(function () {
    const key = $(this).attr(':href').slice(5); // Remove 'data.' from the start
    const value = _.get(data, key);
    if (value) {
      $(this).attr('href', value);
    }
  });

  $('[:alt]').each(function () {
    const key = $(this).attr(':alt').slice(5); // Remove 'data.' from the start
    const value = _.get(data, key);
    if (value) {
      $(this).attr('alt', value);
    }
  });

  return $('body').html();
}

module.exports = compile;
