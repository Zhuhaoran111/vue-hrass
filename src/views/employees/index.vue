<template>
    <div class="employees-container">
        <div class="app-container">
            <!-- 通用工具栏组件使用 -->
            <page-tools>
                <!-- 自定义左侧内容 -->
                <template #slot-left>
                    <span>共 19 条记录</span>
                </template>

                <!-- 自定义右侧内容 -->
                <template #slot-right>
                    <el-button type="danger" size="small" @click="uploadBtnFn">导入excel</el-button>
                    <el-button type="success" size="small" @click="exportBtnFn">导出excel</el-button>
                    <el-button type="primary" size="small" @click="addEmployee">新增员工</el-button>
                </template>
            </page-tools>

            <!-- 下列表+分页 -->
            <el-card style="margin-top: 10px;">
                <el-table border :data="employeesList" height=680px style="width:100%">
                    <el-table-column align="center" type="index" label="序号" />
                    <el-table-column align="center" prop="username" label="姓名" />
                    <el-table-column align="center" prop="staffPhoto" label="头像">
                        <template v-slot="{ row }">
                            <image-holder class="staffPhoto" :src="row.staffPhoto" />
                        </template>
                    </el-table-column>
                    <el-table-column align="center" prop="mobile" label="手机号" />
                    <el-table-column align="center" prop="workNumber" label="工号" sortable
                        :sort-method="workNumberSortFn" />
                    <el-table-column align="center" prop="formOfEmployment" label="聘用形式" :formatter="formatter">
                        <!-- 使用插槽技术时，2)需要用到组件内的变量--作用域插槽 -->
                        <!--作用域插槽
                          1）在组件内，用<slot 属性名="组件内的变量值"></slot> (table-column写好内部叫row)
                          2)在插槽内，用template v-slot="变量名"  (变量会收集slot身上色属性和值形成对象)
                          两种写法
                          slot-scope="scope"  (vue2.6之前)
                          v-slot="scope"
                          3)条件表达式只能英语true和false(如果有第三种情况就要用枚举)
                       -->
                        <!-- <template v-slot="scope">
                          <span>{{ formatter(scope.row) }}</span>
                      </template> -->
                    </el-table-column>>
                    <el-table-column align="center" prop="departmentName" label="部门" />
                    <el-table-column align="center" prop="timeOfEntry" label="入职时间" :formatter="timeFormatter" />
                    <el-table-column align="center" label="操作" width="280">
                        <template v-slot="{ row }">
                            <el-button type="text" @click="lookDetailFn(row.id, row.formOfEmployment)">查看</el-button>
                            <el-button type="text" @click="assignRoleBtn(row)">分配角色</el-button>
                            <el-button type="text">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <!-- 分页组件 -->
                <el-row type="flex" justify="center" align="middle" style="height: 60px">
                    <!-- 分页区域 -->
                    <!-- justify设置居中的方式left center  right -->
                    <el-pagination :current-page="query.page" :page-sizes="[10, 15, 20, 25]" :page-size="query.size"
                        layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
                        @current-change="handleCurrentChange" />
                </el-row>
            </el-card>

            <!-- 新增员工弹框组件 -->
            <el-dialog v-if="employeeDialog" :title=textMap[dialogStatus] :visible.sync="employeeDialog" width="40%"
                @close="closeDialog">
                <emp-Form refs="empForm" :treeData="treeData" @closeDialog="closeDialog"
                    @getEmployeeList="getEmployeeList" />
            </el-dialog>

            <!-- 员工-分配角色权限 - 弹窗 -->
            <el-dialog title="分配角色" :visible="showRoleDialog">
                <!-- 设置角色组件 -->
                <assign-role-dialog ref="assignRole" @closeRoleDialog="cancleDialog" @addRole="addRole"
                    :getRoleList="allRoleList" />
            </el-dialog>

        </div>
    </div>
</template>

<script>



import { getRolesAPI, getEmployeeListAPI, getUserPhotoApi, departmentsListAPI, assignRolesAPI } from '@/api'   //获取复选框角色的接口
// 树形结构的转换方法
import { transTree } from '@/utils'
//下面这种引用要学习下
import Employees from '@/api/constant'
import EmpForm from './components/empForm'
import AssignRoleDialog from './components/assignRoleDialog.vue'
import dayjs from 'dayjs'
import monPng from '@/assets/image/mon.png'
import arrowPng from '@/assets/image/arrow.png'
import upPng from '@/assets/image/up.png'

export default {
    name: 'Employees',
    components: { EmpForm, AssignRoleDialog },
    data() {
        return {
            monPng,
            arrowPng,
            upPng,
            value1: '',
            value2: '',
            value3: '',
            value4: '',
            dialog: false,
            form: {
                name: '',
                region: '',
                date1: '',
                date2: '',
                delivery: false,
                type: [],
                resource: '',
                desc: ''
            },
            formLabelWidth: '80px',
            timer: null,

            showRoleDialog: false,//分配角色的弹框(显示和隐藏)
            employeeDialog: false,//新增显示隐藏按钮
            query: {
                page: 1, // 页码
                size: 10 // 每页条数
            },
            employeesList: [], // 员工列表
            allRoleList: [],//复选框中所有的角色列表
            total: 0, // 数据总条数
            hireTypeList: Employees.hireType,   //枚举数组
            textMap: {
                'create': '新增员工',
                'update': '编辑员工'
            },
            dialogStatus: '',
            treeData: [],
            allEmployeeList: [],//所有员工的列表
            clickEmpId: ''  //当前行员工的id
        }
    },

    created() {
        this.getEmployeeList()   //获取员工列表
        this.getDepartmentsList()  //获取部门列表
        this.getRoleList()    //获取用户角色列表
    },

    methods: {
        //分配角色的事件
        async assignRoleBtn(empObj) {
            const { data } = await getUserPhotoApi(empObj.id)
            this.showRoleDialog = true
            this.clickEmpId = empObj.id  //为保存分配橘角色的id做个中转
            //如果你要传的值，子组件里面data里面有定义，可以直接利用this.$refs来选中这组件的实例

            //Vue更新Dom的动作是异步的
            //知识点：上一句话是同步代码，会把所有的同步代码执行完毕，才会更新真实的DOM(弹框内组件才出现)
            //加入立刻获取弹窗内容组件可能获取不到,

            //等待异步DOM更新完毕后，vue才会回调()里的函数体执行
            this.$nextTick(() => {
                this.$refs.assignRole.roleIdsList = data.roleIds
            })
        },
        //取消分配角色的事件
        cancleDialog() {
            this.showRoleDialog = false
        },
        //保存分配的角色
        async addRole(roleIdsList) {
            const res = await assignRolesAPI({
                id: this.clickEmpId,   //分配角色当前行的id,从上面用一个中转变量获取
                roleIds: roleIdsList
            })
            this.$message.success(res.message)
        },

        //初始化请求角色列表(所有)
        async getRoleList() {
            const { data } = await getRolesAPI({
                page: 1,
                pagesize: 10
            })
            const allRole = await getRolesAPI({
                page: 1,
                pagesize: data.total
            })
            this.allRoleList = allRole.data.rows
        },

        //员工列表的查看详情
        lookDetailFn(empId, formOfEmploymentId) {
            this.$router.push(`/employees/detail?id=${empId}&form=${formOfEmploymentId}`)
        },

        //导入excel按钮的点击事件,为了跳转到本地的文件
        uploadBtnFn() {
            this.$router.push('/excel')
        },
        //导出excel文件
        //import()方法，webpack提供的一种模块引入的方法(你可以写到外面去)
        //类似于懒加载，点击导出按钮的时候，才去引入对应的js
        //import()方法
        //参数:要引入的包名/路由
        //返回值：Promise对象

        exportBtnFn() {
            import('@/vendor/Export2Excel').then(excel => {
                //excel:左侧模块导出的对象
                const tHeader = ['序号', '姓名', '头像', '手机号', '工号', '聘用形式', '部门', '入职时间']

                //核心:把请求回来的数组套对象的数据，转成只有值的二维数组
                //Object.value()->传入对象，返回所有值的数组

                //1.遍历数组中的每个对象
                // const newArr = this.employeesList.map(item => {
                //     return Object.values(item)    //['2018-11-30','1','管理员',...]   //item对象中所有的值形成一个数组
                // })

                //上面的问题:数据和头部纵向对应不上
                //原因：Object.values()取出的值是无序的,没办法和tHeader按顺序对应
                //想办法，让我们的值数组里顺序和tHeader顺序对应上

                //1.中文——>英文的映射关系(枚举值)
                //序号在遍历的时候就有索引值了,所以它的值不用去英文对象里面去获取
                let zhAddEnObj = {
                    '姓名': 'username',
                    '头像': 'staffPhoto',
                    '手机号': 'mobile',
                    '工号': 'workNumber',
                    '聘用形式': 'formOfEmployment',
                    '部门': 'departmentName',
                    '入职时间': 'timeOfEntry'
                }
                //2.遍历每个英文对象
                const newArrayVlaue = this.allEmployeeList.map((item, index) => {
                    //遍历每个中文的值
                    let newArr = []
                    tHeader.forEach(zhKey => {
                        if (zhKey === '序号') {
                            newArr.push(index + 1)
                        } else {
                            //这里是换取中文对应的英文的key
                            let enKey = zhAddEnObj[zhKey]
                            //拿英文的key去换取对象中的值
                            const value = item[enKey]
                            if (enKey === 'formOfEmployment') {
                                let obj = Employees.hireType.find(item => item.id === parseInt(value))   //返回一个对象,
                                newArr.push(obj ? obj.value : '未知')
                            } else {
                                newArr.push(value)
                            }

                        }
                    })
                    return newArr
                })
                console.log(newArrayVlaue)
                // console.log(newArr)
                const data = newArrayVlaue
                //export_json_to_excel()方法是vender/Export2Excel.js文件内封装的导出excel文件的方法
                excel.export_json_to_excel({
                    //表格文件的列标题(数组)
                    header: tHeader,
                    //表格里第二行开始的正文数据(二维数组)
                    //其中内层数组里直接写行的内容值
                    data,
                    //导出的excel的文件名(无需写后缀)
                    filename: '文件名',
                    //单元格的宽度自适应
                    autoWidth: true,
                    //文件类型
                    bookType: 'xlsx'
                })
            })
        },

        //写法一：
        // formatter(row) {
        //     const obj = Employees.hireType.find((item) => item.id === row.formOfEmployment)
        //     return obj ? obj.value : '未知'
        // }
        //写法2： 格式化表格的某一项
        formatter(row, column, cellValue, index) {
            //cellValue的值就是列表组件el-clolumn绑定的formOfEmployment的值

            // 用数组的 find 方法找到 id = 1 的元素，再取出它的 value
            //find找到符合条件的对象
            const obj = Employees.hireType.find((item) => item.id === cellValue)
            return obj ? obj.value : '未知'
        },

        //工号的排序方法
        workNumberSortFn(a, b) {
            console.log(a, b)
            // 打印a和b发现是表格数组里的对象
            // sort方法使用:
            // 如果return小于0, 那么 a 会被排列到 b 之前
            // 如果return等于0, 那么 a 和 b 位置不变
            // 如果return大于0, 那么 a 会被排列到 b 之后
            return parseInt(a.workNumber) - parseInt(b.workNumber)
        },

        //格式化时间处理这种时间 "2018-11-02T08:00:00.000+0000"
        timeFormatter(row) {
            return dayjs(row.timeOfEntry).format('YYYY-MM-DD')
        },

        //获取员工列表的数据
        async getEmployeeList() {
            //采用这种一次性解构的方式
            const { data: { rows, total }, } = await getEmployeeListAPI(this.query)
            this.employeesList = rows
            this.total = total

            const allRes = await getEmployeeListAPI({
                page: 1,
                size: total
            })
            this.allEmployeeList = allRes.data.rows
        },

        // 获取树行组件的数据(部门列表)
        async getDepartmentsList() {
            const res = await departmentsListAPI()
            if (!res.success) return this.$message.error(res.message)
            this.treeData = transTree(res.data.depts, '')

        },

        // 每页显示的条数发生改变时触发
        handleSizeChange(newSize) {
            this.query.size = newSize
            this.getEmployeeList()
        },

        // 当前页面发生改变时触发
        handleCurrentChange(newPage) {
            this.query.page = newPage
            this.getEmployeeList()
        },
        //新增员工
        addEmployee() {

            this.dialogStatus = 'create'
            this.employeeDialog = true
        },
        //关闭的回调
        closeDialog() {
            this.employeeDialog = false
            // 方法2：
            //this——>拿到的是本组件的对象
            //this.$refs.empForm->拿到的是empForm组件对象(好比this.$refs.empForm=empForm组件里面的this)
            // this.$refs.empForm.$refs.empForm这个就访问到了里面el-form的组件对象了
            // this.$refs.empForm.$refs.empForm.resetFields()
            // this.$refs.empForm.$refs.empForm.clearValidate()
        }
    }
}
</script>

<style lang="scss" scoped>
::v-deep .el-drawer__container {
    position: relative;
    left: 0;
    right: 0;
    top: 50px;
    bottom: 0;
    height: 65%;
    width: 100%;
}

.demonstration {
    flex: 1;
    padding-top: 7px;
    color: black;
}

.block {
    flex-direction: row;
}



.styleCest div {
    justify-content: center;
    align-items: center;
    margin-left: 10px;
    margin-right: 10px
}

// .divStyle {
//     margin-top: 50%
// }

.box-card {
    height: 100%;
}

.pie {
    position: relative;
    margin: 25px auto;
    padding: px;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    border: 4px solid rgba(241, 241, 241, 1);
    list-style: none;
    overflow: hidden;

}


.center {
    position: absolute;
    width: 100px;
    height: 100px;
    top: 55px;
    left: 55px;
    border-radius: 50%;

}

.slice {
    overflow: hidden;
    position: absolute;
    top: 0;
    right: -18px;
    width: 50%;
    height: 50%;
    transform-origin: -19% 98%;
}

.slice-one {
    transform: rotate(-22.5deg) skewY(-45deg);
}

.slice-one img {
    transform: skewY(45deg) rotate(22.5deg);
    margin-top: 50px;
    /* margin-left: 30px; */
}

.slice-two {
    transform: rotate(22.5deg) skewY(-45deg);

}

.slice-two img {
    transform: skewY(45deg) rotate(158deg);
    margin-top: 50px;
    /* margin-left: 30px; */
}

.slice-three {
    transform: rotate(67.5deg) skewY(-45deg);

}

.slice-three img {
    transform: skewY(45deg) rotate(22.5deg);
    margin-top: 50px;
    /* margin-left: 30px; */
}

.slice-four {
    transform: rotate(112.5deg) skewY(-45deg);

}

.slice-four img {
    transform: skewY(45deg) rotate(158deg);
    margin-top: 50px;
    /* margin-left: 30px; */
}

.slice-five {
    transform: rotate(157.5deg) skewY(-45deg);

}

.slice-five img {
    transform: skewY(45deg) rotate(22.5deg);
    margin-top: 50px;
    /* margin-left: 30px; */
}

.slice-six {
    transform: rotate(202.5deg) skewY(-45deg);

}

.slice-six img {
    transform: skewY(45deg) rotate(158deg);
    margin-top: 50px;
    /* margin-left: 30px; */
}

.slice-seven {
    transform: rotate(247.5deg) skewY(-45deg);

}

.slice-seven img {
    transform: skewY(45deg) rotate(22.5deg);
    margin-top: 50px;
    /* margin-left: 30px; */
}

.slice-eight {
    transform: rotate(292.5deg) skewY(-45deg);

}

.slice-eight img {
    transform: skewY(45deg) rotate(158deg);
    margin-top: 50px;
    /* margin-left: 30px; */
}

.innerStyle {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    border: 4px solid rgba(241, 241, 241, 1);
    ;
    text-align: center;
    line-height: 80px;
}

.staffPhoto {
    width: 100px;
    height: 100px;
    border-radius: 50%;
}
</style>
