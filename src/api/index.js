import request from "@/utils/request";

export function login(username, password, imageCode, deviceId) {
  return request({
    url: '/yc-busi-basics/authentication/form',
    headers: {
      deviceId,
      isToken: false,
      Authorization: "Basic eWM6c2VjcmV0"
    },
    method: 'post',
    params: {username, password, imageCode}
  })
}

// 刷新方法
export function refreshToken() {
  return request({
    url: '/yc-busi-basics/auth/token',
    method: 'post'
  })
}

export function getInfo() {
  return request({
    url: '/yc-busi-basics/system/selInfo',
    method: 'get'
    // ,
    // headers: {
    //   isToken:true
    // }
  })
}