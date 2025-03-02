import { defineComponent, inject, onMounted, onUnmounted, reactive, toRefs } from 'vue';
import useMove from '@renderer/mixins/drag'
import { menuShow, menuOn, menuListenersRemove } from '@renderer/config/menu';
import { ElMessage } from 'element-plus';
const { ipcRenderer } = require("electron");
import socket from '@renderer/utils/socket'
import moon from '@renderer/store'
import { setCookie, getCookie } from '@renderer/utils/tool'

export default defineComponent({
  name: 'dialogLogin',
  props: {
    dialogVisible: Boolean
  },
  setup(props, context) {
    const state = reactive({
      value: null,
      password: null,
      restaurants: [
        { value: "Root", password: "q", arturl: 'https://img0.baidu.com/it/u=2646185998,3900821575&fm=253&fmt=auto&app=138&f=JPEG?w=400&h=400'},
        { value: "LixPabor", password: "currency123", arturl: 'https://himg.bdimg.com/sys/portrait/item/wise.1.34e37c47.mffK6OgXuMmfRzKuI7flGw.jpg?time=3667' },
        { value: "Administrator", password: "currency123", arturl: 'https://img1.baidu.com/it/u=2626139180,1799659217&fm=253&fmt=auto&app=138&f=JPEG?w=400&h=400' },
        { value: "Spare01", password: "currency123", arturl: 'https://img2.baidu.com/it/u=545361740,2471025881&fm=253&fmt=auto&app=138&f=JPEG?w=538&h=500' },
        { value: "Spare02", password: "currency123", arturl: 'https://img1.baidu.com/it/u=2453887706,2673720703&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500' },
        { value: "灰太狼气球", password: "currency123", arturl: 'https://img2.baidu.com/it/u=247411357,1332972594&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500' },
        { value: "尤达大师", password: "currency123", arturl: 'https://img1.baidu.com/it/u=496025556,4148887618&fm=253&fmt=auto&app=138&f=JPEG?w=518&h=500' },
        { value: "麻油百香果", password: "Fullstack123", arturl: 'https://img0.baidu.com/it/u=1135208145,2674949746&fm=253&fmt=auto&app=138&f=PNG?w=500&h=500' },
      ],
    });
    const querySearch = (queryString: string, cb) => {
      const results = queryString
        ? state.restaurants.filter(createFilter(queryString))
        : state.restaurants
      cb(results)
    }
    const createFilter = (queryString) => {
      return (restaurant) => {
        return (
          restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) ===
          0
        )
      }
    }
    const chatLogin = () => {
      if (!state.restaurants.find(ev => state.value == ev.value)) {
        ElMessage({
          type:'error',
          message:"只能使用默认账号名称登录！"
        })
        return
      } else if (state.restaurants.find(ev => state.value == ev.value).password != state.password) {
        ElMessage({
          type:'error',
          message:"密码不正确！"
        })
        return
      }
      moon.setState({
        uid: state.value,
        password: state.password,
        arturl: state.restaurants.find(ev => ev.value == state.value).arturl
      }, 'userInfo')
      setCookie('uid', state.value, 10)
      setCookie('password', state.password, 10)
      setCookie('arturl', encodeURI(state.restaurants.find(ev => ev.value == state.value).arturl), 10)
      
      const temU = state.restaurants.filter(i => {
        return state.value == i.value
      })
      if (temU.length) {
        context.emit('DialogVisible', false)
      } else {
        ElMessage({
          type:'error',
          message:"只能使用默认账号名称登录！"
        })
      }
    }
    onMounted(() => {
      if (getCookie('uid') && getCookie('password')) {
        moon.setState({
          uid: getCookie('uid'),
          password: getCookie('password'),
          arturl: decodeURI(getCookie('arturl'))
        }, 'userInfo')
        context.emit('DialogVisible', false)
      }
    })
    onUnmounted(() => { 
    })
    return { 
      ...toRefs(state),
      querySearch,chatLogin
    };
  }
});