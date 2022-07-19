let Vue = null

class VueRouter {
  constructor(options) {
    this.$options = options // 定义当前实例化的配置
    // 通过Vue隐藏api定义响应式数据 保证组件依赖渲染函数刷新
    Vue.util.defineReactive(this, 'matches', [])
    // 定义当前current路由地址
    this.current = window.location.hash.slice(1) || '/'
    // 监听hashchange事件去更新当前current值
    window.addEventListener('hashchange', this.dealHashChange.bind(this))
    // 初始化匹配路由栈
    this.initMatches()
  }
  // 匹配路由队列
  initMatches () {
    this.matches = []
    this.match()
  }

  // 处理hash change
  dealHashChange () {
    this.current = window.location.hash.slice(1) // window.location.hash -> #/xxx -> /xxx
    this.initMatches() // 初始化匹配路由栈
  }
  
  // 递归匹配当前路由配置是否有嵌套结构
  match (routes) {
    const curRoutes = routes || this.$options.routes
    const current =  this.current
    for (const route of curRoutes) {
      // 初始化第一层的匹配
      if (current === '/' && route.path.includes('/')) {
        this.matches.push(route)
        break
      } else if (route.path !== '/' && current.includes(route.path)) {
        this.matches.push(route)
        // 递归children数据
        if (route.children) {
          this.match(route.children)
        }
        break
      }
    }
  }
}

VueRouter.install = function (_Vue) {
  // 保存全局的一个Vue实例子
  Vue = _Vue
  // 混入$router实例子 从rooter配置上获取 ps: 这样可以在组件渲染前添加 是个小技巧
  Vue.mixin({
    beforeCreate() {
      // 判断当前组件实例是否包含router配置。 -> root
     if (this.$options.router) {
      Vue.prototype.$router = this.$options.router
     }
    }
  })
  // 注册组件
  Vue.component('router-link', {
    props: {
      to: {
        type: String,
        required: true
      }
    },
    render(h) {
      // 渲染对应a标签 并使用to属性
      return h('a', {
        attrs: { href: `#${this.to}` }
      }, this.$slots.default)
    }
  })

  Vue.component('router-view', {
    render(h) {
      this.$vnode.data.isRouterView = true // 标识当前是routerView组件

      let depth = 0;
      let parent = this.$parent
      // 递归循环当前routerView的层级
      while(parent && parent.$vnode) {
        const isRouterView = parent.$vnode.data && parent.$vnode.data.isRouterView
        // 增加层级
        if (isRouterView) depth++ 
        // 向上递归
        parent = parent.$parent
      }

      // 根据当前层级取出当前路由配置
      const matches = this.$router.matches[depth]
      let component = null
      if (matches) component = matches.component
      // 渲染组件
      return h(component)
    }
  })
}

export default VueRouter