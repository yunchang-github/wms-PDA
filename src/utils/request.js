import axios from "axios";
import { Toast, Dialog } from "vant";
import errorCode from "@/utils/errorCode";
import cache from "@/plugins/cache";
import { refreshToken } from "@/api/index";
import { getToken, getRefreshToken, setToken } from "@/utils/auth";
import store from '@/store'
import Cookies from "js-cookie";
// 是否显示重新登录
export let isRelogin = { show: false };
// 请求队列
let requestList = [];
// 是否正在刷新中
let isRefreshToken = false;

function tansParams(params) {
  let result = ''
  for (const propName of Object.keys(params)) {
    const value = params[propName];
    var part = encodeURIComponent(propName) + "=";
    if (value !== null && typeof (value) !== "undefined") {
      if (typeof value === 'object') {
        for (const key of Object.keys(value)) {
          if (value[key] !== null && typeof (value[key]) !== 'undefined') {
            let params = propName + '[' + key + ']';
            var subPart = encodeURIComponent(params) + "=";
            result += subPart + encodeURIComponent(value[key]) + "&";
          }
        }
      } else {
        result += part + encodeURIComponent(value) + "&";
      }
    }
  }
  return result
}

axios.defaults.headers["Content-Type"] = "application/json;charset=utf-8";
// 创建axios实例
const service = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL: process.env.VUE_APP_URL,
  // 超时
  timeout: 1000000,
});

// request拦截器
service.interceptors.request.use(
  (config) => {
    if (config.isShowLoading) {
      if (config.loadMsg) {
        store.commit("updateApiLoadMsg", config.loadMsg)
      }
      store.commit("updateApiLoading", true)
    }
    // 是否需要设置 token
    const isToken = (config.headers || {}).isToken === false;
    if (getToken() && !isToken) {
      config.headers["Authorization"] = "bearer " + getToken(); // 让每个请求携带自定义token 请根据实际情况自行修改
    }
    // 是否需要防止数据重复提交
    const isRepeatSubmit = (config.headers || {}).repeatSubmit === false;
    // params参数处理
    if (config.params) {
      let url = config.url + "?" + tansParams(config.params);
      url = url.slice(0, -1);
      config.params = {};
      config.url = url;
    }

    // 没有 params参数的 post put请求
    if (
      !isRepeatSubmit &&
      (config.method === "post" || config.method === "put") &&
      config.types !== "file"
    ) {
      const requestObj = {
        url: config.url,
        data:
          typeof config.data === "object"
            ? JSON.stringify(config.data)
            : config.data,
        time: new Date().getTime(),
      };
      const sessionObj = cache.session.getJSON("sessionObj");
      if (
        sessionObj === undefined ||
        sessionObj === null ||
        sessionObj === ""
      ) {
        cache.session.setJSON("sessionObj", requestObj);
      } else {
        const s_url = sessionObj.url; // 请求地址
        const s_data = sessionObj.data; // 请求数据
        const s_time = sessionObj.time; // 请求时间
        const interval = 1000; // 间隔时间(ms)，小于此时间视为重复提交
        if (
          s_data === requestObj.data &&
          requestObj.time - s_time < interval &&
          s_url === requestObj.url
        ) {
          const message = "数据正在处理，请勿重复提交";
          console.warn(`[${s_url}]: ` + message);
          return Promise.reject(new Error(message));
        } else {
          cache.session.setJSON("sessionObj", requestObj);
        }
      }
    }
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  async (res) => {
    if (res.config.isShowLoading) {
      store.commit("updateApiLoading", false)
    }
    // 未设置状态码则默认成功状态
    const code = res.data.code || 200;
    // 获取错误信息
    const msg = errorCode[code] || res.data.msg || errorCode["default"];
    // 二进制数据则直接返回
    if (
      res.request.responseType === "blob" ||
      res.request.responseType === "arraybuffer"
    ) {
      if (res.config.isNotDownFile) {
        return res.data;
      } else {
        let downFileName = res.config.fileName || "新建文件";
        let tempStr = res.headers["content-disposition"];
        if (!res.config.fileName && tempStr) {
          downFileName = decodeURIComponent(tempStr);
        }
        let blob = new Blob([res.data], {
          type: "application/msexcel;charset=utf-8",
        });
        // 兼容ie11
        if (window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(blob, downFileName);
        } else {
          let downloadElement = document.createElement("a");
          //创建下载的链接
          let href = window.URL.createObjectURL(blob);
          downloadElement.href = href;
          //下载后文件名
          downloadElement.download = downFileName;
          document.body.appendChild(downloadElement);
          //点击下载
          downloadElement.click();
          //下载完成移除元素
          document.body.removeChild(downloadElement);
          //释放掉blob对象
          window.URL.revokeObjectURL(href);
        }
      }
    }
    if (code === 401) {
      handleAuthorized()
      // if (!isRelogin.show) {
      //   isRelogin.show = true;
      //   // console.log(getRefreshToken());
      //   // 1. 如果获取不到刷新令牌，则只能执行登出操作
      //   if (!getRefreshToken()) {
      //     return handleAuthorized();
      //   }
      //   // 2. 进行刷新访问令牌
      //   try {
      //     const refreshTokenRes = await refreshToken();
      //     // 2.1 刷新成功，则回放队列的请求 + 当前请求
      //     setToken(refreshTokenRes.data);
      //     requestList.forEach((cb) => cb());
      //     return service(res.config);
      //   } catch (e) {
      //     // 为什么需要 catch 异常呢？刷新失败时，请求因为 Promise.reject 触发异常。
      //     // 2.2 刷新失败，只回放队列的请求
      //     requestList.forEach((cb) => cb());
      //     // 提示是否要登出。即不回放当前请求！不然会形成递归
      //     return handleAuthorized();
      //   } finally {
      //     requestList = [];
      //     isRefreshToken = false;
      //   }
      // } else {
      //   return new Promise((resolve) => {
      //     requestList.push(() => {
      //       res.config.headers["Authorization"] = "bearer " + getToken(); // 让每个请求携带自定义token 请根据实际情况自行修改
      //       resolve(service(res.config));
      //     });
      //   });
      // }
    } else if (code === 500) {
      Toast.fail({
        message: msg, //数量为空
        position: "top",
      });
      return Promise.reject(new Error(msg));
    } else if (code !== 200) {
      Toast.fail({
        message: res.data.msg, //数量为空
        position: "top",
      });
      return Promise.reject(res.data.msg);
    } else {
      return res.data;
    }
  },
  async (error) => {
    if (error.config.isShowLoading) {
      store.commit("updateApiLoading", false)
    }
    let { message } = error;
    if (message === "Network Error") {
      message = "后端接口连接异常";
    } else if (message.includes("timeout")) {
      message = "系统接口请求超时";
    } else if (message.includes("Request failed with status code")) {
      const sub = message.substr(message.length - 3);
      if (sub == 500 && error.response.data && error.response.data.message) {
        message = error.response.data.message;
      } else {
        message = "系统接口" + sub + "异常";
      }
      if (sub === "401") {
        handleAuthorized()
        // 如果未认证，并且未进行刷新令牌，说明可能是访问令牌过期了
        // if (!isRefreshToken) {
        //   isRefreshToken = true;
        //   // 1. 如果获取不到刷新令牌，则只能执行登出操作
        //   if (!getRefreshToken()) {
        //     return handleAuthorized();
        //   }
        //   // 2. 进行刷新访问令牌
        //   try {
        //     const refreshTokenRes = await refreshToken({
        //       grant_type: "refresh_token",
        //       refresh_token: getRefreshToken(),
        //     });
        //     // 2.1 刷新成功，则回放队列的请求 + 当前请求
        //     let expiresIn = new Date(
        //       new Date().getTime() + refreshTokenRes.expires_in * 1000
        //     );
        //     Cookies.set("admin-Token", refreshTokenRes.access_token, {
        //       expires: expiresIn,
        //     });
        //     Cookies.set("admin-Refresh-Token", refreshTokenRes.refresh_token, {
        //       expires: new Date(new Date().getTime() + 600000 * 1000),
        //     });
        //     Cookies.set("admin-Expires-In", expiresIn, { expires: expiresIn });
        //     requestList.forEach((cb) => cb());
        //     return service(error.config);
        //   } catch (e) {
        //     // 为什么需要 catch 异常呢？刷新失败时，请求因为 Promise.reject 触发异常。
        //     // 2.2 刷新失败，只回放队列的请求
        //     requestList.forEach((cb) => cb());
        //     // 提示是否要登出。即不回放当前请求！不然会形成递归
        //     return handleAuthorized();
        //   } finally {
        //     requestList = [];
        //     isRefreshToken = false;
        //   }
        // } else {
        //   return new Promise((resolve) => {
        //     requestList.push(() => {
        //       error.config.headers["Authorization"] = "bearer " + getToken(); // 让每个请求携带自定义token 请根据实际情况自行修改
        //       resolve(service(error.config));
        //     });
        //   });
        // }
      }
    }
    if (error.config.url.indexOf("/authentication/form") !== -1) {
      message = error.response.data.content;
    }
    Toast.fail({
      message: message, //数量为空
      position: "top",
    });
    return Promise.reject(error);
  }
);

function handleAuthorized() {
  if (!isRelogin.show) {
    isRelogin.show = true;
    Toast.fail({
      message: "登录状态已过期", //数量为空
      position: "top",
    });
    isRelogin.show = false;
    let timer = setTimeout(() => {
      location.href = process.env.NODE_ENV === 'production' ? "/pdaWms/" : "/";
      clearTimeout(timer)
    }, 1000)

  }
  return Promise.reject("无效的会话，或者会话已过期，请重新登录。");
}

export default service;
