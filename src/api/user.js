import request from '@/utils/request'

/**
 * 登录接口
 * @param {*} data 
 * @returns 
 */


export function loginAPI(data) {
    return request({
        url: '/sys/login',
        method: 'POST',
        //headers:{} axios默认会带请求头Content-type:'application/json'
        //Content-type:'application/json' ->请求体里的参数和值，会变成JSON字符串格式给后台
        data: data
    })
}

//获取用户的基本资料
export function getProfileApi() {
    return request({
        url: '/sys/profile',
        method: 'POST',
    })
}

//获取员工的基本信息(获取头像)
export function getUserPhotoApi(id) {
    return request({
        url: `/sys/user/${id}`,  //把员工的id带在路径上传给后台
        method: 'GET',  //默认get，可写可不写
    })
}


