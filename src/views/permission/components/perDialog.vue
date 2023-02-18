<template>
    <div>
        <el-dialog :title="isEdit ? '编辑权限点' : '新增权限点'" :visible="showPerssion" @close="permissonCancel">
            <!-- 表单 -->
            <el-form ref="perssionDialog" :model="formData" :rules="rules" label-width="120px">
                <el-form-item label="权限名称" prop="name">
                    <el-input v-model="formData.name" style="width:90%" />
                </el-form-item>
                <el-form-item label="权限标识" prop="code">
                    <el-input v-model="formData.code" style="width:90%" />
                </el-form-item>
                <el-form-item label="权限描述">
                    <el-input v-model="formData.description" style="width:90%" />
                </el-form-item>
                <el-form-item label="开启">
                    <el-switch v-model="formData.enVisible" active-value="1" inactive-value="0" />
                </el-form-item>
            </el-form>
            <el-row slot="footer" type="flex" justify="center">
                <el-col :span="6">
                    <el-button size="small" type="primary" @click="savePerssion">确定</el-button>
                    <el-button size="small" @click="permissonCancel">取消</el-button>
                </el-col>
            </el-row>
        </el-dialog>
    </div>
</template>

<script>
export default {

    props: {
        // 是否显示弹层
        showPerssion: {
            type: Boolean,
            default: false
        },
        isEdit: {
            type: Boolean,
            default: false
        },
        //获取列表扁平的数据
        faltPermissionList: {
            type: Array,
            default: () => { [] }
        }
    },
    data() {
        //校验规则:
        //需求：要求权限名称同级的不能相等，权限标识时唯一的，无论是父级还是子级都是唯一
        const validName = (rule, value, callback) => {
            // //formData.pid(新增对象时的pid)
            // this.permissionList.filter((item) > item.pid === this.formData.pid)
            //点击新增时,会把自己同级的pid相等的对象选出来放到一个数组，然后在把这些同级的数组取出名字，
            //拿到相等pid的名字后案后includes,判断，只要你当前添加的权限值value于只要于添加的同级的name相同则提示。
            //编辑需要把自己排除出去
            //  item.pid === this.formData.pid && item.id !== this.formData.id    
            //选出来的同级pid有两个条件
            //1:必须是与自己pid相同，并且它的id不能与自己相等， this.formData.pid && item.id !== this.formData.id 

            //这是首先走的，如果是编辑，后面在做赋值
            let nameList = this.faltPermissionList.filter((item) => item.pid === this.formData.pid).map(item => item.name)
            if (this.isEdit) {
                nameList = this.faltPermissionList.filter((item) => item.pid === this.formData.pid && item.id !== this.formData.id).map(item => item.name)
            }
            nameList.includes(value) ? callback(new Error(`权限点${value}名字已经存在`)) : callback()
        }
        //下面与上面同样
        const validaCode = (rule, value, callback) => {
            let codeList = this.faltPermissionList.map(item => item.code)
            if (this.isEdit) {
                //这里的item => item.code可以不写
                codeList = this.faltPermissionList.filter(item => item.id !== this.formData.id).map(item => item.code)
            }
            codeList.includes(value) ? callback(new Error(`权限标识${value}已经存在`)) : callback()
        }
        return {
            permissionList: [], // 权限管理列表数据

            formData: {
                name: '', // 名称
                code: '', // 权限标识
                description: '', // 描述
                enVisible: '0', // 开启
                pid: '', // 添加到哪个节点下
                type: '' // 类型吖
            },
            rules: {
                name: [
                    { required: true, message: '权限名称不能为空', trigger: 'blur' },
                    { validator: validName, trigger: 'blur' }
                ],
                code: [
                    { required: true, message: '权限标识不能为空', trigger: 'blur' },
                    { validator: validaCode, trigger: 'blur' }
                ]
            }
        }
    },
    methods: {
        //关闭权限弹窗
        permissonCancel() {
            this.$emit('closePerssionDialog')
            //这个只能置表单里面v-model的值，一些编辑和其他的值id多余的值不会被清空
            //自己手动清空
            //拿到上面的data选项，再次调用data函数，返回带初始值的对象
            //第一种写法
            this.formData = this.$options.data().formData
            this.$refs.perssionDialog.resetFields()
            //第二种写法
            Object.assign(this.formData, this.$options.data().formData)

        },
        savePerssion() {
            // 验证用户是否输入了必填项
            this.$refs.perForm.validate(async valid => {
                if (valid) {
                    this.$emit('savePerssion', { ...this.formData })
                    this.$emit('closePerssionDialog')
                }
            })
        }
    }
}

</script>