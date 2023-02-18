// 导入axios实例
import request from '@/utils/request'

/**
 * @description: 获取员工列表
 * @param {*} params {page:当前页,size：每页条数}
 * @return {*}
 */
export function getEmployeeListAPI(params) {
    return request({
        url: '/sys/user',
        methods: 'get',
        params
    })
}

//传query参数就要用params接受



/**
 * @description: 添加员工
 * @param {*} data
 * @return {*}
 */
export function addEmployeeAPI(data) {
    return request({
        method: 'post',
        url: '/sys/user',
        data
    })
}

/**批量导入员工
 * @description: 导入excel
 * @param {*} data
 * @return {*}
 */
export function importEmployeeAPI(data) {
    return request({
        url: '/sys/user/batch',
        method: 'post',
        data
    })
}

/**根据员工的id更新员工的基本信息
 * @description: 员工的数据对象
 * @param {*} data
 * @return {*}
 */
export function updateEmployeesAPI(empObj) {
    return request({
        url: `/sys/user/${empObj.id}`,
        method: 'PUT',
        data: empObj
    })
}


/**
 * @description: 为员工分配角色
 * @param {*} data { id:当前用户id, roleIds:选中的角色id组成的数组 }
 * @return {*}
 */
export function assignRolesAPI(data) {
    return request({
        url: '/sys/user/assignRoles',
        data,
        method: 'put'
    })
}
