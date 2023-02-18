import router, { asyncRoutes } from './router'
// import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // 进度条插件
import getPageTitle from '@/utils/get-page-title'


NProgress.configure({ showSpinner: false }) // NProgress Configuration

//白名单数组，无需登录，可以跳转查看的路由地址(这些必须在路由表里里)
const whiteList = ['/login', '/404']


//路由的前置守卫
//路由守卫里面必须要有一个next()调用出口，让路由页面跳转
router.beforeEach(async (to, from, next) => {
  NProgress.start()

  const token = store.getters.token
  if (token) {
    //登录了还想要去登录页(手动改地址页)
    if (to.path === '/login') {
      //中断要跳转/login这次导航，重新跳转到/
      next('/')
      NProgress.done()  //中断后要手动关闭这个顶部跳转
    } else {
      next()
      //登录的去别的页面
      //如果拿不到name，则去重新获取用户资料信息
      if (!store.getters.name) {
        await store.dispatch('user/getUserInfoActions')

        //始终动态添加8个路由规则对象
        //路由切换时的路由规则对象数组存在于内存中的
        //new Router时，有一些初始的路由规则对象
        //addRoutes,会给路由表，在添加额外的一个规则对象
        //现象：路由规则对象添加成功,但是左侧导航不见了
        router.addRoutes(asyncRoutes)

        // 给vuex也同步一份，将动态路由传递给 mutation 方法，进行合并   asyncRoutes是8个路由
        store.commit('permission/setRoutes', asyncRoutes)

      }

    }
  } else {
    //没有token没有登录,去的路径有没有在这个白名单里面，在名单里面就放行
    if (whiteList.includes(to.path)) {
      next()
    } else {
      //没有登录去首页(强制打回到登录页)
      next('/login')
      NProgress.done()
    }
  }
})

//路由的后置守卫
router.afterEach((to, from) => {
  //正常next()执行跳转了，才会走后置守卫，关闭正常流程的进度条
  document.title = getPageTitle(to.meta.title)
  // 隐藏进度条效果
  NProgress.done()
})
