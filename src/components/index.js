import PageTools from '@/components/PageTools'
import UploadImg from '@/components/uploadImg'
import ImageHolder from '@/components/ImageHolder'
// - Vue.use()执行对象里面的install方法,在方法内使用Vue.component注册了全局组件
//问题：为何用use包裹component方法，而不再外面写
//原因：可以直接引入后，调内置准备好的方法+全部注册的代码(使用者方便)

//插件使用Vue.use的写法
//默认导出一个对象
export default {
    install(Vue) {
        // 在 install 方法中，使用 Vue.component 挂载组件
        Vue.component('PageTools', PageTools)
        Vue.component('UploadImg', UploadImg)
        Vue.component('ImageHolder', ImageHolder)
    }
}


//导出的方式
// export 变量声明 -> import {变量名}   类似于api的导出方式
//export dafault导出  ->import 变量名   
