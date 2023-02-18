<template>
    <!-- 表单 -->
    <el-form ref="empForm" :model="formData" :rules="rules" label-width="120px">
        <el-form-item label="姓名" prop="username">
            <el-input style="width:50%" v-model="formData.username" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
            <el-input style="width:50%" v-model="formData.mobile" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="入职时间" prop="timeOfEntry">
            <el-date-picker style="width:50%" v-model="formData.timeOfEntry" placeholder="请选择入职时间" />
        </el-form-item>
        <el-form-item label="聘用形式" prop="formOfEmployment">
            <el-select style="width:50%" v-model="formData.formOfEmployment" placeholder="请选择" value="">
                <el-option v-for="(item, index) in hireType" :key="item.id" :label="item.value" :value="item.id">
                </el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="工号" prop="workNumber">
            <el-input style="width:50%" v-model="formData.workNumber" placeholder="请输入工号" />
        </el-form-item>
        <el-form-item label="部门" prop="departmentName">
            <el-input style="width:50%" v-model="formData.departmentName" placeholder="请选择部门"
                @focus="departmentNameFocus" />
            <div class="tree-box" v-if="showTree">
                <el-tree @node-click="treeClick" :data="treeData" default-expand-all :props="{ label: 'name' }" />
            </div>
        </el-form-item>
        <el-form-item label="转正时间" prop="correctionTime">
            <el-date-picker style="width:50%" v-model="formData.correctionTime" placeholder="请选择转正时间" />
        </el-form-item>
        <el-form-item><el-button @click="closeEmployeeDialog">取 消</el-button>
            <el-button type="primary" @click="saveEmploy">保
                存</el-button></el-form-item>

    </el-form>
</template>
        
<script>
// 导入需要枚举的导入
import EmployeeEnum from '@/api/constant'
//外面时export default 默认导出  不用加{}但是要命名引入
//外卖时命名导出，必须按需映入，带{}
import { addEmployeeAPI } from '@/api'
export default {
    name: 'empForm',
    props: {
        //部门列表
        treeData: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            clickDepartName: '', // 点击的部门名字
            showTree: false,//部门树形控件显示和隐藏
            hireType: EmployeeEnum.hireType, // 聘用形式数据绑定
            // 添加表单字段
            formData: {
                username: '', // 用户名
                mobile: '', // 手机号
                formOfEmployment: '', // 聘用形式
                workNumber: '', // 工号
                departmentName: '', // 部门
                timeOfEntry: '', // 入职时间
                correctionTime: '' // 转正时间
            },
            rules: {
                username: [
                    { required: true, message: '用户姓名不能为空', trigger: 'blur' },
                    { min: 1, max: 4, message: '用户姓名为1-4位', trigger: 'blur' }
                ],
                mobile: [
                    { required: true, message: '手机号不能为空', trigger: 'blur' },
                    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
                ],
                formOfEmployment: [
                    { required: true, message: '聘用形式不能为空', trigger: 'blur' }
                ],
                workNumber: [
                    { required: true, message: '工号不能为空', trigger: 'blur' }
                ],
                departmentName: [
                    { required: true, message: '部门不能为空', trigger: 'change' }
                ],
                timeOfEntry: [
                    { required: true, message: '请选择入职时间', trigger: 'blur' }
                ]
            }
        }
    },
    watch: {
        //需求：点击了部门后，不允许用户手动改值，只能选择。
        // 1.一种方式：利用readonly
        //2.第二种方式：Todo监听对象中的某个属性的写法???
        'formData.departmentName'(newVal) {
            // 采用老师的方法的问题，检测resetFields也出触发了，用v-if则不用
            // if (newVal.length === 0) {
            //     return   //阻止代码往下执行
            // }

            //你点击的名字与新值不同，说明用户修改的值
            if (newVal !== this.clickDepartName) {
                this.formData.departmentName = this.clickDepartName
            }

        }
    },
    methods: {
        //部门输入框的聚焦，点击输入框时，出现部门
        departmentNameFocus() {
            this.showTree = true
        },
        //data:点击那一行的数据对象
        treeClick(data) {
            // 如果当前部门还有子部门，则不能被选中
            if (data && data.children) {
                //点击的有孩子则返回，下面的两行代码不显示
                return
            }
            // 把当前选中的节点显示在 input 框中
            this.formData.departmentName = data.name

            // 临时保存点击的部门名字
            this.clickDepartName = data.name

            // 隐藏 tree
            this.showTree = false

        },
        //取消和保存的回调，叉号和蒙层在外面
        closeEmployeeDialog() {
            this.$refs['empForm'].resetFields()  //重置表单----有时可用，有时不可
            this.$refs['empForm'].clearValidate()  //清除校验
            this.$emit('closeDialog')
        },

        //保存
        saveEmploy() {
            this.$refs.empForm.validate(async valid => {
                if (valid) {
                    const res = await addEmployeeAPI(this.formData)
                    if (res.success) {
                        this.$message.success(res.message)
                        // 提示后, 重新请求列表
                        this.$emit('getEmployeeList')
                        this.closeEmployeeDialog()
                    } else {
                        this.$message.error(res.message)
                    }
                }
            })
        }
    }
}

</script>
        


