import { loginAPI, getProfileApi, getUserPhotoApi } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'

const getDefaultState = () => {
  return {
    token: getToken(),  //vuex里里面的state的值，使用本地持久化的
    userInfo: {}, //保存用户的基本资料
    name: '',
    avatar: ''
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token  //vuex里面的state存一份
    setToken(token)    //在给本地存一份
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  //删除token
  REMOVE_TOKEN(state) {
    state.token = '',
      removeToken()
  },
  //操作userInfo这个变量，value就是请求到的用户信息
  SET_USER(state, value) {
    state.userInfo = value
  },
  // 删除用户信息
  REMOVE_USER(state) {
    state.userInfo = {}
  }
}

const actions = {
  //封装的登录逻辑
  async loginActions({ commit }, data) {
    const res = await loginAPI(data)
    //当前子模块内不需要加模块名
    commit('SET_TOKEN', res.data)
    return res   //把结果但会调用处
  },

  //封装获取用户基本信息的逻辑,不想用state.commit，直接{commit解构}
  async getUserInfoActions({ commit }) {
    //说明一下这个解构赋值
    //请求的数据中都是在res.data中，左边的data正好解构，获取里面所属有的属性然后把值给到userObj和photoObj
    //然后解构合并到一个对象中
    //理解2，对象中的key匹配，key匹配，在把data的值赋给userObj这个变量
    const { data: userObj } = await getProfileApi()
    const { data: photoObj } = await getUserPhotoApi(userObj.userId)  //这里传一个员工的id
    commit('SET_USER', { ...userObj, ...photoObj })

    //commit提交给mutations方法,保存到userInfo上
  },
  //封装退出时登录逻辑(被动退出(token过期)和主动退出)
  logoutActions({ commit }) {
    //commit提交给mutations方法
    //清除token和用户信息
    commit('REMOVE_TOKEN')
    commit(' REMOVE_USER')
    //state清除，getters也会清除
  }

}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

