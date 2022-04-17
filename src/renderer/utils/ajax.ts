import axios from 'axios';
import { ElMessage, ElLoading } from 'element-plus';
import qs from 'qs';
('use strict');

// var baseURL = 'http://124.220.16.124:8888/';
var baseURL = 'http://127.0.0.1:8888/';

axios.interceptors.request.use(
  function (conf) {
    return conf;
  },
  function (error) {
    // 抛出请求错误信息
    Promise.reject(error.response);
  }
); // 添加响应拦截器

axios.interceptors.response.use(
  function (response) {
    if (response.data === '') {
      return Promise.reject();
    }
    return response.data;
  },
  function (err) {
    // 请求失败处理

    // 判断请求异常信息中是否含有超时timeout字符串
    if (err.message.includes('timeout')) {
      console.log('错误回调', err);
      ElMessage.error('网络超时');
    }
    if (err.message.includes('Network Error')) {
      console.log('错误回调', err);
      ElMessage.error('服务端未启动，或网络连接错误');
    }
    return Promise.reject(err);
  }
);

const getData = function getData(url, params) {
  return new Promise(function (resolve, reject) {
    params = {
      params: params,
    };
    axios
      .get(baseURL + url, params)
      .then(function (res) {
        resolve(res);
      })
      .catch(function (err) {
        console.log(err);
        reject(err);
      });
  });
};

const postData = function postData(url, params) {
  return new Promise(function (resolve, reject) {
    axios
      .post(baseURL + url, qs.stringify(params))
      .then(function (res) {
        resolve(res);
      })
      .catch(function (err) {
        reject(err);
      });
  });
};
const formatPostData = function formatPostData(url, formData) {
  return new Promise(function (resolve, reject) {
    axios({
      url: baseURL + url,
      method: 'post',
      data: formData,
    })
      .then(function (res) {
        resolve(res);
      })
      .catch(function (err) {
        reject(err);
      });
  });
};

const getCookie = function getCookie(sName) {
  var aCookie = document.cookie.split('; ');

  for (var i = 0; i < aCookie.length; i++) {
    var aCrumb = aCookie[i].split('=');
    if (sName == aCrumb[0]) return decodeURIComponent(aCrumb[1]);
  }
  return null;
};
// 对象转url参数
const queryParams = function (data, isPrefix = false) {
  let prefix = isPrefix ? '?' : '';
  let _result = [];
  for (let key in data) {
    let value = data[key];
    // 去掉为空的参数
    if (['', undefined, null].includes(value)) {
      continue;
    }
    if (value.constructor === Array) {
      value.forEach(_value => {
        _result.push(encodeURIComponent(key) + '[]=' + encodeURIComponent(_value));
      });
    } else {
      _result.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
    }
  }
  return _result.length ? prefix + _result.join('&') : '';
};

// 上传文件接口
const uploadFile = async function (file) {
  const result = await formatPostData(baseURL + 'api/uploadFile', file).then(res => {
    return res;
  });
  return result;
};

export default { getData, formatPostData, postData, getCookie, queryParams, uploadFile };
