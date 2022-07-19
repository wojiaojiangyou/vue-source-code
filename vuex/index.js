let Vue = null
// 定义store类
class Store {
  constructor (options) {
    const _this = this
    // 挂载对象配置
    this._getters = options.getters
    this._mutations = options.mutations
    this._actions = options.actions
    // 方法调用绑定当前对象实例
    this.commit = this.commit.bind(this)
    this.dispatch = this.dispatch.bind(this)
    // 处理getters
    const computed = {}
    const getters = {}
    Object.keys(_this._getters).forEach(key => {
      const fn = _this._getters[key]
      // 包裹成computed属性
      computed[key] = function () {
        return fn(_this.state)
      }
      // 定义数据对象读取为计算属性 限制其它对象操作
      Object.defineProperty(getters, key, { get: () => _this._vm[key]})
    })
    this.getters = getters
    // 定义响应式数据 ps: $$可以不被vue劫持数据
    this._vm = new Vue({
      data () {
        return {
          $$state: options.state,
        }
      },
      computed
    })
  }

  get state () {
    return this._vm._data.$$state
  }

  set state (val) {
    console.error('state数据对象不能被赋予值')
  }

  commit (type, payload) {
    const mutation = this._mutations[type]
    if (!mutation) {
      console.error('当前没有相应的mutation方法，确认参数是否正确')
      return
    }

    mutation(this.state, payload)
  }

  dispatch (type, payload) {
    const action = this._actions[type]
    if (!action) {
      console.error('当前没有相应的action方法，确认参数是否正确')
      return
    }
    // 这边调用传入当前this实例 包含多方法操作
    action(this, payload)
  }

}

function install (_Vue) {
  Vue = _Vue
  // 组件内混入$store
  Vue.mixin({
    beforeCreate () {
      // 判断是否根组件包含store实例
      if (this.$options.store) {
        Vue.prototype.$store = this.$options.store
      }
    }
  })
}


export default {
  Store,
  install
}