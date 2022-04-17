import { defineComponent, inject, onMounted, onUnmounted, reactive, toRefs, getCurrentInstance } from 'vue';
// getCurrentInstance  获取当前实例
import useMove from '@renderer/mixins/drag';
import { menuShow, menuOn, menuListenersRemove } from '@renderer/config/menu';
import { ElMessage } from 'element-plus';
const { ipcRenderer } = require('electron');
import socket from '@renderer/utils/socket';
import moon from '@renderer/store';
import { setCookie, getCookie } from '@renderer/utils/tool';
import { stat } from 'fs';

export default defineComponent({
  name: 'dialogLogin',
  props: {
    dialogVisible: Boolean,
  },
  setup(props, context) {
    const { proxy } = getCurrentInstance(); // 获取当前实例
    const state = reactive({
      value: 'lxlxbaba',
      password: 'lxlxbaba',
      restaurants: [],
    });
    const querySearch = (queryString: string, cb) => {
      const results = queryString ? state.restaurants.filter(createFilter(queryString)) : state.restaurants;
      cb(results);
    };
    const createFilter = queryString => {
      return restaurant => {
        return restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0;
      };
    };
    const chatLogin = async () => {
      console.log(state, 'state');

      const params = {
        userName: state.value, // 用户名
        passWord: state.password, // 密码
      };
      const data = await proxy.$axios.postData('api/login', params);
      if (data.errcode === 0) {
        moon.setState(
          {
            uid: state.value,
            password: state.password,
            arturl: data.data.photo || 'https://placekitten.com/400/400', // 默认自动生成图片连接
          },
          'userInfo'
        );
        setCookie('uid', state.value, 10);
        setCookie('password', state.password, 10);
        setCookie('arturl', encodeURI(data.data.photo || 'https://placekitten.com/400/400'), 10);
        context.emit('DialogVisible', false);
        // const temU = state.restaurants.filter(i => {
        //   return state.value == i.value;
        // });
        // if (temU.length) {
        //   context.emit('DialogVisible', false);
        // } else {
        //   ElMessage({
        //     type: 'error',
        //     message: '只能使用默认账号名称登录！',
        //   });
        // }
      } else {
        ElMessage({
          type: 'error',
          message: data.message || '只能使用默认账号名称登录！',
        });
      }
      // if (!state.restaurants.find(ev => state.value == ev.value)) {
      //   ElMessage({
      //     type: 'error',
      //     message: '只能使用默认账号名称登录！',
      //   });
      //   return;
      // } else if (state.restaurants.find(ev => state.value == ev.value).password != state.password) {
      //   ElMessage({
      //     type: 'error',
      //     message: '密码不正确！',
      //   });
      //   return;
      // }
      // moon.setState(
      //   {
      //     uid: state.value,
      //     password: state.password,
      //     arturl: state.restaurants.find(ev => ev.value == state.value).arturl,
      //   },
      //   'userInfo'
      // );
      // setCookie('uid', state.value, 10);
      // setCookie('password', state.password, 10);
      // setCookie('arturl', encodeURI(state.restaurants.find(ev => ev.value == state.value).arturl), 10);
      // const temU = state.restaurants.filter(i => {
      //   return state.value == i.value;
      // });
      // if (temU.length) {
      //   context.emit('DialogVisible', false);
      // } else {
      //   ElMessage({
      //     type: 'error',
      //     message: '只能使用默认账号名称登录！',
      //   });
      // }
    };
    onMounted(() => {
      if (getCookie('uid') && getCookie('password')) {
        moon.setState(
          {
            uid: getCookie('uid'),
            password: getCookie('password'),
            arturl: decodeURI(getCookie('arturl')),
          },
          'userInfo'
        );
        context.emit('DialogVisible', false);
      }
    });
    onUnmounted(() => {});
    return {
      ...toRefs(state),
      querySearch,
      chatLogin,
    };
  },
});
