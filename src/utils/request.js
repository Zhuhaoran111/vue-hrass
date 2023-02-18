import axios from 'axios'
import router from '@/router'
import { MessageBox, Message } from 'element-ui'
//这边单独使用message
import store from '@/store'
//这里要取出vuex里面的数据

const service = axios.create({
  //process.env  是node.js内置固定的环境变量对象
  // 1.
  // npm run dev ->启动开发服务，项目根目录 .env.development 环境变量配置文件里的值
  // 添加到process.env对象上

  //2.
  //npm run build:prod启动打包，项目根目录 .env.production 环境变量配置文件里的值
  //添加到process.env对象上

  //开发的时候用的是基地址1
  //上线的时候用的基地址2

  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 5000
})
//
//请求拦截器
service.interceptors.request.use(
  config => {
    //拿到vuexi里面的token
    const token = store.getters.token
    if (token) {
      //请求头携带token
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)
//响应数据
service.interceptors.response.use(
  //因为后台成功和失败都是200，所以要以success这个字段作为判断条件
  //response参数，axios响应对象(里面config/header/status/data字段)
  //data字段里面对应才是后台返回的全部数据也是一个对象
  //第一个data是axios自带的
  //第二个data是后台返回数据对象的
  response => {
    const { success, message } = response.data
    if (success) {
      // Message.success(message)
      return response.data
      //这里直接返回页面的直接是后台完整的数据对象，不再是
      //后台axios封装的response对象(防止逻辑页面要.两次data)
    } else {
      //逻辑失败,把后台返回的message提示文字返回到逻辑页面
      //返回Promise的reject拒绝状态(await无法接受，进入catch)
      Message.error(message)
      return Promise.reject(message)
    }
  },
  //状态码为4** 5**进入到下面这里
  error => {
    //4xx的状态，如果后台返回了响应数据，我们就用下,如果没有就使用error本身对象的值
    Message.error((error.response && error.response.data && error.response.data.message) || error.Message)
    //上面是报错就提示，下面是具体分析
    //通过http状态码判断,error.response.status===401
    //还可以通过code来判断(10002是和后台约定俗成的码值，就代表token过期)
    //知识点：?.可选链操作符，新版语法，需要babel支持才能用
    //左侧有值才会继续向下点属性(防止空值.任意的属性报错)
    if (error?.response?.data?.code === 10002) {
      //token过期,清除token回到登录页(vuex和本地都得清除)，把用户信息页清除
      //dispatch调用actions里面定义的方法
      //返回登录页并传一个未遂地址参数(被动也要把未遂地参数传给登录页)
      store.dispatch(`user/logoutActions`)
      store.replace(`login/redirect=${router.currentRoute.fullPath}`)

    }
    return Promise.reject(error)
  }
)

export default service
