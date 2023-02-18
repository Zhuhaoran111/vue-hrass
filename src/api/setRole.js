// 导入axios实例
import request from '@/utils/request'

/**
 * @description 获取所有角色信息
 * @param {*} params  {page:页码数, pagesize：每页的条数}
 * @returns   Promise对象
 */
export function getRolesAPI(params) {
    return request({
        url: '/sys/role',
        method: 'GET',
        params
    })
}

/**
 * @description 获取公司信息
 * @param {*} companyId
 * @returns
 */
export function getCompanyInfoAPI(companyId) {
    return request({
        url: `/company/${companyId}`
    })
}

/**
 * @description: 新增角色
 * @param {*} data {name,description}
 * @return {*}
 */
export function addRoleAPI(data) {
    return request({
        url: '/sys/role',
        method: 'post',
        data
    })
}

/**
 * @description: 获取某一个角色列表详情
 * @param {*} id
 * @return {*}
 */
export function getRoleIdAPI(id) {
    return request({
        url: `/sys/role/${id}`
    })
}

/**
 * @description: 编辑角色(根据角色的id更新角色)
 * @param {*} data
 * @return {*}
 */
export function updateRoleAPI(roleObj) {
    return request({
        url: `/sys/role/${roleObj.id}`,
        method: 'put',
        data: roleObj
    })
}

/**
 * @description: 删除角色
 * @param {*} id 角色id
 * @return {*}
 */
export function deleteRoleAPI(id) {
    return request({
        url: `/sys/role/${id}`,
        method: 'delete'
    })
}


/**
 * 给角色分配权限
 * @param {*} data {id:角色id, permIds:[] 所有选中的节点的id组成的数组}
 * @returns
 */
export function assignPermAPI(data) {
    return request({
        url: '/sys/role/assignPrem',
        method: 'put',
        data
    })
}