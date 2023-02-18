//api里统一出口，这样逻辑页面直接引入api,不需要考虑接口方法具体在哪个名字文件里
//导入所有的user.js里按需导出的方法，并按需中转导出

export * from './user.js'
export * from './department.js'
export * from './setRole.js'
export * from './employee.js'
export * from './permission.js'