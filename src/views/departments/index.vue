<template>
    <div class="departments-container">
        <div class="app-container">
            <!-- el-card 卡片布局(分为头和体2部分)
        第一个子标签就是头(需要设置slot="header"-插槽)
        知识点: vue2.6之前写具名插槽的写法slot="具名插槽名字" 之后v-slot:header, #header
        第二个子标签部分就是身体 -->
            <!-- el-tab-pane有几个, 就有几个tab标签导航
               el-tab-pane夹着的内容, 就是这个导航对应的内容
               el-card只用到了头(没有体), 体用的是el-tab标签导航的身体内容(一切放在了卡片的头里写)

               el-tabs: Tabs标签页导航
                      v-model: 绑定点击激活的name值
                      @tab-click: tab导航点击事件
               el-tab-pane: 每个tab标签导航
                      label: tab导航显示文字
                      name: 点击关联到v-model的值(默认值'1')
           -->
            <div slot="header" class="clearfix"></div>
            <el-card class="box-card">
                <el-tabs v-model="activeName" @tab-click="handleClick">
                    <el-tab-pane label="组织架构" name="first" class="tab-pane">
                        <!-- 1.头部 -->
                        <el-row type="flex" justify="space-between" align="middle" class="department-header">
                            <!-- 第一列20份 -->
                            <el-col :span="20">
                                <i class="el-icon-s-home" />
                                <span class="company">江苏传智播客教育科技股份有限公司</span>
                            </el-col>
                            <!-- 第二列4份 -->
                            <el-col :span="4">
                                <!-- 在容器范围里, 一行再分2列 -->
                                <el-row type="flex" justify="end">
                                    <el-col>负责人</el-col>
                                    <el-col>
                                        <!-- 这个之前在头部导航右侧下拉菜单讲过 -->
                                        <el-dropdown>
                                            <!-- 下拉菜单文字 -->
                                            <span class="el-dropdown-link">
                                                操作<i class="el-icon-arrow-down el-icon--right" />
                                            </span>
                                            <!-- 下拉项 -->
                                            <el-dropdown-menu slot="dropdown">
                                                <!-- 一级部门的pid就是'' -->
                                                <el-dropdown-item
                                                    @click.native="addDepartment()">添加子部门</el-dropdown-item>
                                            </el-dropdown-menu>
                                        </el-dropdown>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                        <!-- el-tree列表 -->
                        <!-- 
                            1.props：配置项
                            label:lable属性的对应值,要对应的是数据对象里面的哪个字段(决定节点行标签显示的中文)
                            children:children属性对应的值，要对应数据对象中的那个字段(来决定节点是否有嵌套的子节点数据)

                            2.node-click
                            el-tree组件行的标签的点击事件(节点的点击事件)

                            3.组件上加冒号和不加冒号的区别
                              ：动态属性，它会把=右侧的变成表达式(加了冒号，右边就是表达式,不加冒号右边就是表达式)
                              表达式：变量，常量和运算符祖成(表达式原地是有结果的) 

                            4.node-key="id"
                              每个树节点用来作为唯一标识的属性(对象里面指定字段值作为标识)，整棵树应该是唯一的(对象里id字段的值作为行标签的唯一标识)

                            5.default-expand-all(是否默认展开所有节点)默认值是false,写了就是true
                            6.:expand-on-click-node="false"，是否在点击节点的时候展开或者收缩节点， 默认值为 true，如果为 false，则只有点箭头图标的时候才会展开或者收缩节点。
                            7.使用插槽技术的时候,想要在插槽具体标签位置，拿到组件内给插槽绑定的属性和值
                              v-slot="变量名" (变量名的值：就会收集slot身上的属性和值形成对象)
                              例如：v-slot="scope" scope的值 组件内源码在slot占位标签身上属性名和值（data:行数据对象)
                              el-table里面绑定是属性名row:行数据对象

                         -->
                        <el-tree class="department-tree" :data="treeData" :props="defaultProps" node-key="id"
                            default-expand-all :expand-on-click-node="false" v-loading="loading">
                            <!-- 还原写法1： #default="{ data }"  写全了就是 v-slot:default="scope" 下面取值的时候就是scope.data.name-->
                            <!-- 还原写法2： 把data里面的值解构从scope里快速取出
                            v-slot:default="{data:data}"  =>简写是v-slot:default="{data}"

                            简化2：v-slot省略成#
                            //99集详解
                            具名插槽default(默认)可以分配给slot标签无名的/有default名字的都可以分配
                            #default直接写成v-slot也可以
                            -->
                            <template #default="{ data }">
                                <el-row type="flex" justify="space-between" align="middle"
                                    style="height: 40px; width: 100%;">
                                    <!-- 部门名字 -->
                                    <el-col :span="20">
                                        <span>{{ data.name }}</span>
                                    </el-col>
                                    <!-- 功能操作区域 -->
                                    <el-col :span="4">
                                        <el-row type="flex" justify="end">
                                            <!-- 两个内容 -->
                                            <el-col>{{ data.manager }}</el-col>
                                            <el-col>
                                                <!-- 下拉菜单 element -->
                                                <!-- trigger="click"这个点击激活，默认时鼠标移入 -->
                                                <el-dropdown trigger="click">
                                                    <span> 操作<i class="el-icon-arrow-down" /> </span>
                                                    <!-- 下拉菜单 -->
                                                    <el-dropdown-menu slot="dropdown">
                                                        <el-dropdown-item
                                                            @click.native="addDepartment(data)">添加子部门</el-dropdown-item>
                                                        <el-dropdown-item
                                                            @click.native="editDepartment(data)">编辑部门</el-dropdown-item>
                                                        <!-- data && !data.children  有子部门就隐藏这个按钮 -->
                                                        <el-dropdown-item v-if="data && !data.children"
                                                            @click.native="delDepartment(data)">删除部门</el-dropdown-item>
                                                    </el-dropdown-menu>
                                                </el-dropdown>
                                            </el-col>
                                        </el-row>
                                    </el-col>
                                </el-row>
                            </template>
                        </el-tree>
                    </el-tab-pane>
                </el-tabs>
            </el-card>

        </div>
        <!-- 添加子部门的弹窗 -->
        <depart-dialog ref="department" v-if="addDepartmentVisible" :addDepartmentVisible="addDepartmentVisible"
            :departId="departId" :employeListArr="employeListArr" :dialogStatus="dialogStatus" :clickId="clickId"
            :oringinList="oringinList" @closeDepartDialog="closeDepartDialog"></depart-dialog>
    </div>
</template>
  
<script>
import { departmentsListAPI, getEmployeeSimpleAPI, getDepartDetailAPI, delDepartmentAPI } from '@/api'
import { transTree } from '@/utils/index.js'   //把扁平数据转换为层级数据
import departDialog from './components/departDialog.vue'
export default {
    name: 'Departments',
    components: { departDialog },
    data() {
        return {
            departId: '',
            addDepartmentVisible: false,
            activeName: 'first', // 被激活的 Tab 标签页
            treeData: [],
            defaultProps: {
                children: 'children',//children属性对应的值，要对应数据对象中的那个字段(来决定节点是否有嵌套的子节点数据)
                label: 'departName'  //lable属性的对应值,要对应的是数据对象里面的哪个字段(决定节点行标签显示的中文)
            },
            loading: true,
            employeListArr: [],
            // departDetailObj: {}  //部门的详情对象(编辑)
            dialogStatus: '',  //区分新增和编辑的状态
            oringinList: [],   //新组成的数据
            clickId: ''
        }
    },
    created() {
        this.getDepartMentsListFn()
        this.getDepartmentUser()
    },
    methods: {
        //获取部门负责人下拉框
        async getDepartmentUser() {
            const { data } = await getEmployeeSimpleAPI()
            this.employeListArr = data
        },

        // 获取部门列表方法
        async getDepartMentsListFn() {
            const res = await departmentsListAPI()
            //把扁平的数据进行要处理的数据，然后进行表单数据进行判断
            //由于大括号被解释为代码块，所以如果箭头函数直接返回一个对象，必须在对象外面加上括号，否则会报错。
            this.oringinList = res.data.depts.map(item => (
                {
                    id: item.id,
                    code: item.code,
                    name: item.name,
                    pid: item.pid,
                }
            ))
            console.log(this.oringinList)
            //传一个扁平数据数组，和一个一级部门的pid
            this.treeData = transTree(res.data.depts, '') // 因为后台返回的字段是id和pid而且根是空字符串, 如果不是需要自己改变transTree里判断条件等
            //子的pid等于父的id
            if (res.code == '10000') {
                this.loading = false
            }
        },
        // handleNodeClick(data) {
        //     console.log(data);
        // },
        // 右侧的添加子部门
        addDepartment(data) {
            console.log(data)
            if (data == undefined) {
                //添加子部门由于要传一个pid，这里父级部门(一级部门)的pid就是''
                this.departId = ''
            } else {
                //添加子部门由于要传一个pid，所以添加部门的pid就是父级部门的id
                this.departId = data.id
            }
            this.dialogStatus = 'create'
            this.addDepartmentVisible = true
        },
        //添加子部门的关闭回调
        closeDepartDialog() {
            this.addDepartmentVisible = false
            this.getDepartMentsListFn()
        },
        // 编辑
        async editDepartment(row) {
            this.addDepartmentVisible = true
            this.dialogStatus = 'update'
            const { data } = await getDepartDetailAPI(row.id)
            // this.departDetailObj = { ...data }
            // this.$refs.department -> 拿到子组件中this的值
            this.$refs['department'].departmentData = { ...data }
        },
        // 删除
        async delDepartment(data) {
            const res = await delDepartmentAPI(data.id)
            //注意，这里buoy那个判断，应为axiso相应拦截器里面，如果是
            //4xx,5xx的http状态码返回reject抓过你太Promise对象，你需要用try,catch捕获，
            //await是拿不到也不往下执行的，如果用success为false也无法向下执行
            //保证awiait下面的代码肯定是成功的才能执行
            //删除成功，提示下，在刷新列表
            this.$message.success(res.message)
            this.getDepartMentsListFn()
        },

    }
}
</script>
  
<style lang="scss" scoped>
.box-card {
    padding: 10px 30px;
}

.tab-pane {
    padding: 20px 80px;

    .company {
        margin-left: 12px;
        font-weight: bold;
        font-size: 14px;
    }

    .department-header {
        height: 50px;
        display: flex;
        align-items: center;
        border-bottom: 1px solid #ccc;
    }

    .department-tree {
        margin: 12px 0px;
    }
}
</style>
  