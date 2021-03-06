/**
 *
 * @param app
 * @return {*}
 *
 * /jobx/job 获取job列表
 *
 */

const moment = require('moment');
const numeral = require('numeral');
require('moment/locale/zh-cn');

module.exports = app => {
  const apiHost = app.config.apiHost;

  class Jobs extends app.Service {
    * queryJobList(query) {
      const result = yield this.ctx.fetch('/jobx/job', { query });
      result.data.map(item => {
        item.platform.name = item.platform.name || '-';
        item.more_link = `${apiHost}/api/jobx/job/${item.id}/url`;
        item.release_date = moment(item.release_date).startOf('day').fromNow();
        item.price = numeral(item.price).format('0,0');
        return item;
      });

      const total = result.total;
      const { page_size, current_page } = result.filter;
      result.filter.total_page = Math.ceil(total / page_size);
      result.filter.pagination = pagination(current_page, result.filter.total_page);

      return result;
    }
  }
  return Jobs;
};


function pagination(curr, total) {
  let arr = [];
  for (let i = curr + 2 > total ? total : curr + 2; i > 0 && i >= curr - 2; i--) {
    arr.push(i);
  }
  arr = arr.reverse();
  if (arr[0] >= 3) {
    arr.unshift('...');
    arr.unshift(1);
  }

  if (arr[arr.length - 1] <= total - 1) {
    arr.push('...');
    arr.push(total);
  }

  return arr;
}
