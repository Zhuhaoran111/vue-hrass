<template>
    <div>
        <!-- 添加子部门的弹窗 -->
        <el-dialog :title="textMap[dialogStatus]" :close-on-click-modal="false" :close-on-press-escape="false"
            :visible.sync="addDepartmentVisible" width="45%" @close="closeDialog">
            <el-form ref="deptForm" :rules="rules" :model="departmentData" label-width="120px">
                <el-form-item label="部门名称" prop="name">
                    <el-input v-model="departmentData.name" style="width:80%" placeholder="1-50个字符" />
                </el-form-item>
                <el-form-item label="部门编码" prop="code">
                    <el-input v-model="departmentData.code" style="width:80%" placeholder="1-50个字符" />
                </el-form-item>
                <el-form-item label="部门负责人" prop="manager">
                    <el-select v-model="departmentData.manager" style="width:80%" placeholder="请选择">
                        <el-option v-for="item in employeListArr" :key="item.id" :label="item.username"
                            :value="item.username" />
                    </el-select>
                </el-form-item>
                <el-form-item label="部门介绍" prop="introduce">
                    <el-input v-model="departmentData.introduce" style="width:80%" placeholder="1-300个字符"
                        type="textarea" :rows="3" />
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="closeDialog">取 消</el-button>
                <el-button type="primary" @click="dialogStatus == 'create' ? saveDepartment() : updateDepartment()">保
                    存</el-button>
            </span>
        </el-dialog>
    </div>
</template>
  
<script>
import { addDepartmentsAPI, updateDepartmentsAPI } from '@/api'
export default {
    props: {
        addDepartmentVisible: {
            type: Boolean,
            default: false
        },
        employeListArr: {
            type: Array,
            default: () => []
        },
        departId: {
            type: String,
            default: null,
        },
        dialogStatus: {
            type: String,
            default: null
        },
        //部门列表--扁平结构
        oringinList: {
            type: Array,
            default: () => [],
            required: true
        }
        // departDetailObj: {
        //     type: Object,
        //     default: () => ({})
        // }
    },
    data() {
        // 1.校验部门编码是否重复
        const validCode = (rule, value, callback) => {
            console.log(value)
            // 判断是否能否找到对应的部门，如果找到了则返回该对象
            //下面是把编码全部放到一个数组里面，然后后面进行判断有没有重复
            let existCodeList = this.oringinList.map(item => item.code)  //['人事部',超级总裁办]
            // 如果存在该对象，则说明编码已经存在，抛出错误
            //编辑部门时
            //问题：自己的编码与自己冲突，正确的效果时，编辑时，自己的部门可以直接使用
            //原因时：把value和所有额部门做了对比
            //解决，把自己从所有的种除去，然后留下自己----把自己过滤掉
            //filter:便利左侧数组中的每个对象,执行()函数体，如果return的值是true就会留下,
            //filter源码内，定义新数组收集符合return条件的，遍历结束后返回新的数组
            if (this.dialogStatus == 'update') {
                debugger
                console.log(this.departmentData.id)
                const newArr = this.oringinList.filter(item => item.id !== this.departmentData.id)   //这里把
                existCodeList = newArr.map(item => item.code)
                console.log(existCodeList)

            }
            existCodeList.includes(value) ? callback(new Error('编码' + value + '已经存在')) : callback()
        }

        //2.校验同级部门是否重复
        const validName = (rule, value, callback) => {
            debugger
            //新增部门的名字：(新增部门的对象)------注意新增的是子部门，起的名字应该是当前父级部门的一些子级部门的名字(所以判断的是一些子级部门)
            //数据规律：子部门的pid=父级部门的id(每个部门都有pid,pid相同的都是同级部门)
            //( item.pid === this.departmentData.id)筛选所有的同级部门的数组，然后再利用map数组把同级部门的name取出来
            let newNameArr = this.oringinList.filter(item => item.pid === this.departId).map(item => item.name)

            if (this.dialogStatus == 'update') {
                //find()方法，找到符合判断条件的哪个对象
                const obj = this.oringinList.find(item => item.id === this.departmentData.id)
                //找到编辑的对象的pid
                const pid = obj.pid
                //拿到pid，才能继续的从所有部门列表中，找到pid相同的对象,并且除掉自己当前点击的
                newNameArr = this.oringinList.filter(item => item.pid === pid && item.id !== this.departmentData.id).map(item => item.name)
            }
            newNameArr.includes(value) ? callback(new Error('部门名称' + value + '已经存在')) : callback()

        }

        return {
            textMap: {
                'create': '新增',
                'update': '编辑'
            },
            departmentData: {
                name: '', // 部门名称
                code: '', // 部门编码
                manager: '', // 部门管理者
                introduce: '' // 部门介绍
            },
            rules: {
                name: [
                    { required: true, message: '部门名称不能为空', trigger: 'blur' },
                    { min: 1, max: 50, message: '部门名称要求1-50个字符', trigger: 'blur' },
                    { validator: validName, trigger: 'blur' }
                ],
                code: [
                    { required: true, message: '部门编码不能为空', trigger: 'blur' },
                    { min: 1, max: 50, message: '部门编码要求1-50个字符', trigger: 'blur' },
                    { validator: validCode, trigger: 'blur' }
                ],
                manager: [
                    { required: true, message: '部门负责人不能为空', trigger: 'change' }
                ],
                introduce: [
                    { required: true, message: '部门介绍不能为空', trigger: 'blur' },
                    { min: 1, max: 300, message: '部门介绍要求1-300个字符', trigger: 'blur' }
                ]
            }
        }
    },
    // watch: {
    //     //监听编辑传过来的数据
    //     departDetailObj() {
    //         this.departmentData = { ...this.departDetailObj }
    //     }
    // },
    created() {
        this.getDepartmentUser()
    },
    methods: {

        //触发关闭弹框的回调
        closeDialog() {
            this.$emit('closeDepartDialog')
        },
        //保存新增部门
        saveDepartment() {
            this.$refs.deptForm.validate(async valid => {
                if (valid) {
                    let params = {
                        ...this.departmentData,
                        pid: this.departId
                    }
                    const res = await addDepartmentsAPI(params)
                    if (res.code = '10000') {
                        this.$message.success(res.message)
                        this.$parent.getDepartMentsListFn()  //通过this.$parent来直接调用父的方法
                    } else {
                        this.$message.error('保存失败')
                    }
                    this.closeDialog()
                }
            })
        },
        //保存编辑部门
        updateDepartment() {
            //兜底校验
            this.$refs.deptForm.validate(async valid => {
                if (valid) {
                    let params = {
                        ...this.departmentData,
                    }
                    const res = await updateDepartmentsAPI(params)
                    if (res.code = '10000') {
                        this.$message.success(res.message)
                        this.$parent.getDepartMentsListFn()  //通过this.$parent来直接调用父的方法
                    } else {
                        this.$message.error('保存失败')
                    }
                    this.closeDialog()
                }
            })
        },
    }
}
</script>
  
<style>

</style>

   <!-- 关于dialog组件，可以支持4种关闭方式
            1.点击遮罩层，会导致弹窗关闭
            2.按下esc键,会导致弹窗关闭
            3.点击右上角的x按钮，会导致弹窗关闭,
            4.点击确认和取消时关闭(自己关闭)

            怎么关闭的diaolog呢，不是直接隐藏了标签，而是改变visible对应的变量为false,内部检测visible属性值为false
            擦隐藏dialog标签的
            子—>父范围的dialogVisible变量

            以前的技术
            1)子组件内恰当时机,this.$emit('自定义时事件名',值)
            2)父组件内，给予子组件标签@自定义事件名="事件处理函数"
            在事件处理函数中，接到子传出的值，赋予给父变量

            .sync语法糖：本质上还是用上面的技术,但是语法上呢有些简化
               1)子组件内恰当时机，this.$emit('update:props变量名',值)
               2)父组件内，给子组件对应props变量名.sync="父范围变量名"

               关于.sync作用：它在运行时，给当前绑定绑定那个自定义事件名和事件处理函数
               @update:visible="val => dialogVisible = val"
               :visible="dialogVisible" 还在

               .sync场景：子->父快速传值并赋予给父范围内的变量
               如果子->父要执行逻辑代码很多代码，这个.sync不能用了，还是用自己绑定的
               
               props变量是只读的,父传子，子不能修改props里面的变量(props里面的变量是通过父传过来的)
               原因:Vue设计上，父如果重新渲染，会给props里的变量重复赋值，你原来在子组件内props赋予的值都会被覆盖丢失
               解决：
               1)用data/computed代替
               2)快速改变父范围的变量(双向绑定)->让父把值改完留回给props影响的组件内(单向数据流)

               单向数据流，尽量让父改变值，重新给props里面的变量赋值(父->子)

         -->