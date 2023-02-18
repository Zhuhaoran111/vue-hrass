<template>
    <div>
        <div>分配权限功能</div>
        <!-- default-expand-all 展开所有节点，官方摩默认是false的意思就是不写default-expand-all默认是不展开的 
        check-strictly 不关联复选框和子和父
         default-checked-keys:设置默认选中的值的id(但是仅仅局限于数组一上来就有值，如果后续赋值，不会影响默认选中)


         node-key="id"  每行的标识     这里的id就是:data="permissionList"这里面id
        -->
        <el-tree ref="tree" :data="permissionList" :props="defaultProps" node-key="id" show-checkbox default-expand-all
            check-strictly></el-tree>
        <el-row class="footer" type="flex" justify="center">
            <el-col :span="6">
                <el-button size="small" @click="cancelButton">取 消</el-button>
                <el-button size="small" type="primary" @click="setRolesBtn">确 定</el-button>
            </el-col>
        </el-row>
    </div>
</template>

<script>
export default {
    name: 'AssignPermission',
    props: {
        permissionList: {
            type: Array,
            default: () => []
        },

        //此角色现有的权限
        permIds: {
            type: Array,
            default: () => []
        }
    },
    watch: {
        permIds(ids) {
            this.$refs.tree.setCheckedKeys(ids)
        }
    },
    data() {
        return {
            defaultProps: {
                children: 'children',
                label: 'name'    //这个看后端返回来的显示的数据，这里的label就是什么，看后端返回的是什么
            }
        }
    },
    created() {
        console.log(this.roleId)
    },
    methods: {
        // 取消按钮
        cancelButton() {
            //这里有3种写法
            //1.普通的事件名
            // this.$emit('setVisible')    //对应的组件内绑定setVisible自定义事件
            //2.update:props变量名    //多次(props变量名这是传过来的显示和隐藏，这里没传)
            // this.$emit('update:props变量名', false)
            //3.input事件传一个false
            this.$emit('input', false)//v-model组件身上只能用一次

        },

        // 设置权限按钮
        setRolesBtn() {
            this.$emit('adderEv', this.$refs.tree.getCheckedKeys())   //把el-tree树中复选框中已经选择的拿到传给父组件
            this.$emit('input', false)//v-model组件身上只能用一次
        }
    }
}
</script>

<style lang="scss" scoped>
.footer {
    margin-top: 30px;
}
</style>
