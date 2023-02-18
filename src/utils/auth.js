import Cookies from 'js-cookie'

const TokenKey = 'vue_admin_template_token'

//读数据
export function getToken() {
  return Cookies.get(TokenKey)
}

//存数据
export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

//删除数据
export function removeToken() {
  return Cookies.remove(TokenKey)
}
