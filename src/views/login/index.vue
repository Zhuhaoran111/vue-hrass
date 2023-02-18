<template>
  <div class="login-container">
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" auto-complete="on"
      label-position="left">

      <div class="title-container">
        <h3 class="title">
          <img src="@/assets/common/login-logo.png" alt="">
        </h3>
      </div>

      <el-form-item prop="mobile">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input ref="mobile" v-model="loginForm.mobile" placeholder="Mobile" name="mobile" type="text" tabindex="1"
          auto-complete="on" />
      </el-form-item>

      <el-form-item prop="password">
        <span class="svg-container">
          <svg-icon icon-class="password" />
        </span>
        <el-input :key="passwordType" ref="password" v-model="loginForm.password" :type="passwordType"
          placeholder="Password" name="password" tabindex="2" auto-complete="on" @keyup.enter.native="handleLogin" />
        <span class="show-pwd" @click="showPwd">
          <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
        </span>
      </el-form-item>

      <el-button :loading="loading" type="primary" style="width:100%;margin-bottom:30px;"
        @click.native.prevent="handleLogin" class="login_btn">登录</el-button>

      <div class="tips">
        <span style="margin-right:20px;">手机号: 13800000002</span>
        <span> 密码:123456 </span>
      </div>

    </el-form>
  </div>
</template>

<script>
import { validMobile } from '@/utils/validate'
import { loginAPI } from '@/api/user'

export default {
  name: 'Login',
  data() {
    const validateMobile = (rule, value, callback) => {

      //这里调用封装validMobile的校验，如果不符合则抛出校验
      if (!validMobile(value)) {
        callback(new Error('请输入正确的的手机号'))
      } else {
        callback()
      }
    }
    return {
      loginForm: {
        mobile: '13800000002',
        password: '123456'
      },
      //validator:自定义的校验规则，这里的函数要在data(){这里面写}
      //校验注意点:rules下面的key一定要和表单中的prop对应
      //model对象和rules对象一定要在el-form中写
      loginRules: {
        mobile: [{ required: true, trigger: 'blur', validator: validateMobile }],
        password: [
          { required: true, trigger: 'blur', min: 6, max: 16, message: '密码长度在6-16位' }
        ]
      },
      loading: false,
      passwordType: 'password',
      redirect: undefined
    }
  },
  watch: {
    $route: {
      handler: function (route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  methods: {
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleLogin() {
      //先进行表单的校验
      this.$refs.loginForm.validate(async valid => {
        if (valid) {
          //这是通过的----发起登录的请求
          try {
            //知识点1：await只能取代Promise对象成功的状态值
            //知识点2：await取代then()函数的，await可以把成功的值提取出来留在原地
            //知识点3：如何捕获Promise错误的状态？使用try...catch()代码替换
            //知识点4：action方法，无论如何都返回Promise对象(自定义的，非axios的)
            //注意点：不加await,会调用登录接口的时候，这个登录异步任务无结果的时候，代码会往下走跳转
            //进去，(问题：密码错了也会跳转)
            //await等待后面成功了，才会执行下面的代码
            const res = await this.$store.dispatch('user/loginActions', this.loginForm)
            if (res) {
              this.$message.success('登录成功')
            }
            //这里登录时拿到路由里面的参数this.$route.query
            this.$router.replace(this.$route.query.redirect || '/')
          } catch (err) {
            this.$message.error(err)
            //一旦try大括号内代码报错就立刻停止try里面的代码向下执行
            //转而直接跳入catch大括号里执行，err形参接受的就是错误的信息对象
            //错误的对象要用console.dir打印
          }

        }
      })
    }
  }
}
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

.login_btn {
  background: #407ffe;
  height: 64px;
  line-height: 32px;
  font-size: 24px;
}

$bg: #283443;
$light_gray: #68b0fe; // 将输入框颜色改成蓝色
$cursor: #68b0fe; // 将输入框光标改成蓝色

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
  background-image: url("~@/assets/common/login.jpg");
  background-position: center;

  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    // background: rgba(0, 0, 0, 0.1);
    background: rgba(255, 255, 255, 0.7);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;

.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;

  .el-form-item__error {
    font-size: 14px
  }

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
}
</style>
