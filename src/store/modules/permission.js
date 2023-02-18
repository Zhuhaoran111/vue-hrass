/**
 * Vuex 权限，动态路由模块
 */

// 导入静态路由表
import { constantRoutes } from '@/router'

export default {
    namespaced: true, // 开启命名空间
    state: () => {
        return {
            routes: constantRoutes
        }
    },
    mutations: {
        // 设置动态路由方法
        setRoutes(state, asyncRoutes) {
            // 将动态路由和静态路由组合起来
            state.routes = [...constantRoutes, ...asyncRoutes]
        }
    },
    getters: {},
    actions: {}
}