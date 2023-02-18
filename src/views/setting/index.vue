<template>
    <div class="setting-container">
        <div class="app-container">
            <!-- 卡片组件 -->
            <el-card class="box-card">
                <!-- 使用 Tabs 组件完成标签页布局 -->
                <el-tabs v-model="activeName">
                    <el-tab-pane label="角色管理" name="first" class="tab-pane">
                        <!-- 新增角色按钮 -->
                        <el-row style="height:60px">
                            <el-button icon="el-icon-plus" size="small" type="primary" @click="addRole">新增角色</el-button>
                        </el-row>
                        <!-- 使用 Table 组件实现用户角色的渲染 -->
                        <el-table border style="width: 100%" :data="rolesList">
                            <el-table-column type="index" label="序号" width="120" align="center" />
                            <el-table-column label="角色名" prop="name" width="240" align="center" />
                            <el-table-column label="描述" prop="description" align="center" />
                            <el-table-column label="操作" align="center">
                                <!-- 
                                    vue2.6之前作用域插槽的写法：slot-scope="scope"(vue向下兼容，之前的都可以使用)
                                    vue2.6新写法：v-slot="scope变量名"
                                    作用域插槽scope变量值，来自于哪里，table-column里slot占位标签身上的属性
                                    <slot row="行数据对象"></slot>
                                    scope变量名:{row:行数据对象}
                                slot-scope="scope"可以换成v-slot="{row}"
                                 -->
                                <template slot-scope="scope">
                                    <el-button size="small" type="success" @click="setRoles(scope.row)">分配权限</el-button>
                                    <el-button size="small" type="primary" @click="editRoles(scope.row)">编辑</el-button>
                                    <el-button size="small" type="danger" @click="delRoles(scope.row)">删除</el-button>
                                </template>
                            </el-table-column>
                        </el-table>

                        <!-- 分页区域 -->
                        <!-- 
                              query: {
                                page: 1, // 当前页面
                                pagesize: 10 // 页面显示的条数
                              }
                            current-page:设置当前的页数就刷新时高亮的当前页码(一般就是1)-------return需要定义
                            page-sizes：选择每页显示的条数(下拉菜单)----不关联数据，逻辑自己写
                            page-size：页面显示的条数,可以任意设置，(一般10条)-------return需要定义
                            layout:total(总条数), sizes(下拉菜单每页条数), prev(上箭头), pager(页码数字), next(下箭头), jumper(指定跳转页)
                                控制灭个小组件是否需要，以及左右排列顺序（影响到页面)
                            total:告诉分页组件，现在有多少条数据，(内部计算页码，渲染页码) 
                            @size-change:(每页条数改变会触发，对应第二个 page-sizes)
                            @current-change(点击页码时触发---对应第一个current-page)
                         -->
                        <el-pagination :current-page="query.page" :page-sizes="[10, 15, 20, 25]"
                            :page-size="query.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"
                            @size-change="handleSizeChange" @current-change="handleCurrentChange" />
                    </el-tab-pane>
                    <el-tab-pane label="公司信息" class="tab-pane">
                        <!--el-alert ----警告提示信息   :closable="false"   是否额可以关闭，   show-icon展现图标-->
                        <el-alert title="对公司名称、公司地址、营业执照、公司地区的更新，将使得公司资料被重新审核，请谨慎修改" type="info" show-icon
                            :closable="false" />
                        <el-form label-width="120px" style="margin-top:50px">
                            <el-form-item label="公司名称">
                                <el-input disabled v-model="companyInfo.name" style="width:400px" />
                            </el-form-item>
                            <el-form-item label="公司地址">
                                <el-input disabled v-model="companyInfo.companyAddress" style="width:400px" />
                            </el-form-item>
                            <el-form-item label="邮箱">
                                <el-input disabled v-model="companyInfo.mailbox" style="width:400px" />
                            </el-form-item>
                            <el-form-item label="备注">
                                <el-input type="textarea" v-model="companyInfo.remarks" :rows="3" disabled
                                    style="width:400px" />
                            </el-form-item>
                        </el-form>
                    </el-tab-pane>
                </el-tabs>
            </el-card>

            <!-- 新增弹框 -->
            <el-dialog title="新增角色" :close-on-click-modal="false" :close-on-press-escape="false" width="30%"
                @close="closeRoleSet" :visible.sync="addRoleDialog">
                <el-form ref="roleForm" :model="roleForm" :rules="roleRules" label-width="100px">
                    <el-form-item label="角色名称" prop="name">
                        <el-input v-model="roleForm.name" />
                    </el-form-item>
                    <el-form-item label="角色描述" prop="description">
                        <el-input type="textarea" v-model="roleForm.description" />
                    </el-form-item>
                </el-form>

                <!-- 底部 -->
                <span slot="footer" class="dialog-footer">
                    <el-button @click="addRoleDialog = false">取消</el-button>
                    <el-button type="primary" @click="saveRole">保存</el-button>
                </span>
            </el-dialog>

            <!-- 分配权限弹框 -->
            <el-dialog title="分配权限" :visible.sync="assignVisible" @close="setVisible" width="50%">
                <!-- 下面的才是封装的组件，不要吧自定义事件写在el-dialog上，上面只写@close -->
                <assign-permission v-model="assignVisible" :permissionList="permissionList" @adderEv="adderEv"
                    :permIds="permIds" />
            </el-dialog>
        </div>
    </div>
</template>
  
<script>
import AssignPermission from './components/assignPermission.vue'
//将扁平的数据转换成树形
import { transTree } from '@/utils/index'
import { getRolesAPI, getCompanyInfoAPI, addRoleAPI, getRoleIdAPI, getProfileApi, updateRoleAPI, deleteRoleAPI, getPermissionListAPI, assignPermAPI } from '@/api'
export default {
    components: { AssignPermission },
    data() {
        return {
            activeName: 'first',
            query: {
                page: 1, // 当前页面
                pagesize: 10 // 页面显示的条数
            },
            rolesList: [], // 角色列表
            total: 0,// 角色数据总条数
            companyInfo: {},
            // ...其他选项
            addRoleDialog: false, // 控制弹框的隐藏和展示
            // 添加角色
            roleForm: {
                name: '',
                description: ''
            },
            isEdit: false,//判断是否时编辑状态(false就是新增，true就是编辑)
            // 添加角色验证
            roleRules: {
                name: [
                    { required: true, message: '角色名称不能为空', trigger: 'blur' }
                ],
                description: [
                    { required: true, message: '角色描述不能为空', trigger: 'blur' }
                ]
            },
            assignVisible: false,//分配角色弹框的显示与隐藏
            permissionList: [], //分配角色用的列表---等会转成树形的结构
            permIds: [], //点击分配权限时获取当前角色的权限点
            clickRoleId: '',  //点击的角色id,分配角色用
        }
    },
    created() {
        this.getRoleListFn()  //获取所有的角色列表
        this.getCompanyInfo()  //获取公司详情
        this.gerPermissionList() //获取权限点的列表

    },
    methods: {

        async gerPermissionList() {
            const { data } = await getPermissionListAPI()
            this.permissionList = transTree(data, '0')
        },
        //解决
        //获取角色列表
        async getRoleListFn() {
            const { data } = await getRolesAPI(this.query)
            this.rolesList = data.rows,
                this.total = data.total

        },
        //获取公司的详情信息
        async getCompanyInfo() {
            //这里传一个公司的id在vuex中this.$store.getters.companyId
            //由于刷新网页，用户信息获取狮子啊路由跳转后，可以让这里先执行，vue多发一次请求，专门获取公司的Id
            // data:
            // company: "传智播客"
            // companyId: "1"
            // mobile: "13800000002"
            // roles: {menus: Array(9), points: Array(26), apis: Array(0)}
            // userId: "604f764971f93f3ac8f365c2"
            // username: "666"
            //解构出companyId(对象嵌套的解构赋值)
            const { data: { companyId } } = await getProfileApi()
            const { data } = await getCompanyInfoAPI(companyId)
            this.companyInfo = { ...data }
        },

        //新增角色
        addRole() {
            this.addRoleDialog = true
            this.isEdit = false
        },

        // 编辑角色
        async editRoles(roleObj) {
            this.addRoleDialog = true
            this.isEdit = true
            const { data } = await getRoleIdAPI(roleObj.id)
            this.roleForm = { ...data }
        },
        //关闭弹框的回调
        closeRoleSet() {
            debugger
            this.addRoleDialog = false
            //1.form自带resetFields()
            this.$refs['roleForm'].resetFields()  //重置表单----有时可用，有时不可用
            //2.利用对象循环的的方式清空
            // for (let k in this.roleForm) {
            //     this.roleForm[k] = ""
            // }
            //3.手动赋值清空
            // this.roleForm = {
            //     name: '',
            //     description: ''
            // }
            //4.暴力清空
            // this.roleForm = {}
            //5.深拷贝

            this.$refs['roleForm'].clearValidate()  //清除校验
        },
        //保存角色
        saveRole() {
            this.$refs.roleForm.validate(async valid => {
                if (valid) {
                    if (this.isEdit) {
                        //编辑
                        const res = await updateRoleAPI(this.roleForm)  //5对key+value
                        this.$message.success(res.message)
                    } else {
                        //新增
                        const res = await addRoleAPI(this.roleForm)   ////2对key+value
                        this.$message.success(res.message)
                    }
                    //新增和编辑共用，都需要关闭弹框和刷新列表
                    this.addRoleDialog = false
                    this.getRoleListFn()

                }
            })
        },
        // 每页显示的条数发生改变时触发(下拉菜单改变)
        handleSizeChange(size) {
            this.query.pagesize = size   //修改参数对象,然后请求刷新页面，重新请求数据
            this.getRoleListFn()
        },

        // 当前页面发生改变时触发(当前页码时触发)
        handleCurrentChange(page) {
            debugger
            this.query.page = page   //修改参数对象,然后请求刷新页面，重新请求数据
            this.getRoleListFn()
        },
        // 删除角色
        delRoles(row) {
            //这个提示后面自己封装下
            this.$confirm('是否删除此内容?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                const res = await deleteRoleAPI(row.id)
                this.$message.success(res.message)
                if (this.rolesList.length === 1) {
                    //如果删除时当前页的最后一页，先page--然后重新请求列表
                    this.query.page--

                    //假设后台要求传递的最少是1，删除剩最后一条数据就是0
                    //删除完成后为0时强制改成1。
                    if (this.query.page === 0) {
                        this.query.page = 1
                    }
                }
                this.getRoleListFn()
            })
            //删除最后页最会一条数据时的bug
            //问题：导致Paginnation标签页码往前走1，但是数据没有获取前面1页的
            //原因:删除最后一条，但是调用刷新列表的query.page还是之前的页码数(后台没有这页的数据,返回空数组,导致表格里面暂时无数据)
            //解决：是否判断当前的数据是当前页的最后一条数据，通过rolesList长度判断
        },
        //分配角色的弹框
        async setRoles(roleObj) {
            //弹窗必须鞋子啊前面，先组件弹窗弹起来，然后先让permIds记录空数组，等你网络
            //请求回来watch才会触发
            this.assignVisible = true
            this.clickRoleId = roleObj.id   //下面的分配角色需要用到，拿到id
            const { data } = await getRoleIdAPI(roleObj.id)
            this.permIds = data.permIds
        },

        // 分配权限弹框隐藏
        setVisible() {
            this.assignVisible = false
        },

        //确定给分配角色
        async adderEv(permIdsList) {
            const res = await assignPermAPI({
                id: this.clickRoleId,
                permIds: permIdsList
            })
            this.$message.success(res.message)
        }

    }
}


</script>
  
<style lang="scss" scoped>
.box-card {
    padding: 10px 30px;
}

.tab-pane {
    padding: 20px;
}

.el-pagination {
    text-align: center;
    margin-top: 20px;
}
</style>