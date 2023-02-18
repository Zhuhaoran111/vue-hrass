<template>
  <div class="navbar">
    <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />
    <div class="app-breadcrumb">江苏传智播客教育科技股份有限公司
      <span class="breadBtn">体验版</span>
    </div>
    <div class="right-menu">
      <el-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
          <img :src="avatar" class="user-avatar">
          <span class="name">{{ name }}</span>
          <i class="el-icon-caret-bottom" style="color:#fff" />
        </div>
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
          <router-link to="/">
            <el-dropdown-item>
              首页
            </el-dropdown-item>
          </router-link>
          <a target="_blank" href="https://gitee.com/shuiruohanyu/hrsaas53">
            <el-dropdown-item>
              项目地址
            </el-dropdown-item>
          </a>
          <el-dropdown-item divided @click.native="logout">
            <span style="display:block;">退出登录</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
//在逻辑页面中怎么引用vuex中的数据中getters的方式
//方式1：在模板中直接使用{{ $store.getters.变量名 }}(如果用模块内getters:$store.getters['模块key名/变量名'])
//方式2：映射的使用
// 1)拿到vuex里面的辅助函数mapGetters(固定名字)
// 2)调用函数，传入要映射过来的getters变量名
//mapGetters(['name'])


import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import router from '@/router'
import { Avatar } from 'element-ui'

export default {
  components: {
    Breadcrumb,
    Hamburger
  },
  computed: {

    //name:function(){
    //     return this.$store.getters.name
    // }
    //下面的name运行时就会变成上面这中样式
    //在原地留下了同名的3个计算属性和来自vuex中的值

    ...mapGetters([
      'sidebar',
      'avatar',
      'name',
    ])
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    // 退出登录
    async logout() {
      this.$confirm('确定脱出登录吗?, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        // 使用 dispath 调用vuex里面actions里面的方法退出登录的方法
        // 其实action无论有么有async, 返回的都是一个Promise对象(vuex内部设置)
        // await等待退出流程代码走完
        await this.$store.dispatch('user/logoutActions')
        // 跳转到登录页面
        //this.$route.path ->路由的地址  /info
        //this.$route.fullPath ->路由地址和参数(完整的路由地址)
        //redirect参数名
        this.$router.push(`/login?redirect=${this.$route.fullPath}`)
        // 退出成功后的提示
        this.$message.success('退出成功!')
      }).catch(() => {
        // 取消退出提示
        this.$message.info('已取消退出')
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {

  height: 50px;
  overflow: hidden;
  position: relative;
  background: rgba(144, 143, 248);
  box-shadow: 0 1px 4px rgba(0, 21, 41, .08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color: transparent;
    //color只能影响文字的颜色/字体图标颜色，影响不了svg的颜色
    //svg标签身上设置fill填充颜色
    color: 'white';

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .app-breadcrumb {
    display: inline-block;
    font-size: 18px;
    line-height: 50px;
    margin-left: 10px;
    color: #ffffff;
    cursor: text;

    .breadBtn {
      background: #84a9fe;
      font-size: 14px;
      padding: 0 10px;
      display: inline-block;
      height: 30px;
      line-height: 30px;
      border-radius: 10px;
      margin-left: 15px;
    }
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        // margin-top: 5px;
        position: relative;

        // 头像
        .user-avatar {
          cursor: pointer;
          width: 30px;
          height: 30px;
          border-radius: 15px;
          vertical-align: middle;
          margin-right: 10px;
        }

        // name
        .name {
          color: #fff;
          vertical-align: middle;
          margin-left: 5px;
        }

        .user-dropdown {
          color: #fff;
        }

        // 下拉 icon 图标位置
        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 20px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
