function defineReactive (obj, key, val) {
  observable(val) // 递归调用对象劫持

  const dep = new Dep() // 定义每个响应式对象key为独立依赖收集对象

  Object.defineProperty(obj, key, {
    get () {
      // 判读当前是否是初始化watcher的时候 读取值并且存放watcher实例
      Dep.target && dep.add(Dep.target)
      return val
    },
    set (newVal) {
      if (val === newVal) return
      // 如果动态添加对象值 给它变成响应式的
      if (typeof newVal === 'object') observable(newVal)
      val = newVal
      // 通知deps更新
      dep.notify()
    }
  })
}


function observable (obj) {
  // 设置响应式数据必须为对象
  if (typeof obj !== 'object' || obj === null) {
    return
  }
  // 循环调用劫持对象
  Object.keys(obj).forEach(key => {
    defineReactive(obj, key, obj[key])
  })
}

// 快速获取数据 this.xxx -> this._data.xxx
function proxy (vm) {
  Object.keys(vm.$data).forEach(key => {
    Object.defineProperty(vm, key, {
      get () {
        return vm.$data[key]
      },
      set (val) {
        vm.$data[key] = val
      }
    })
  })
}

// 定义Vue
class Vue {
  constructor (options) {
    this.vm = this
    // 存储下配置数据
    this.$options = options
    this.$data = options.data
    // 添加观察
    observable(this.$data)
    // 劫持读取数据
    proxy(this)
    // 挂载节点
    this.mount()
  }

  // 挂载
  mount (dom) {
    const el = dom || document.querySelector(this.$options.el)
    const updateComponent = () => {
      const vnode = this.$options.render.call(this, this.createElement)
      // 判断是否是第一次加载
      if (!this._vnode) {
        this._update(el, vnode)
        // 调用mounted函数
        this.$options.mounted.call(this.vm)
      } else {
        const preVnode = this._vnode
        this._update(preVnode, vnode)
      }
      // 保存上次的vnode节点
      this._vnode = vnode
    }
    // 定义组件级watcher
    new Watcher(this, updateComponent)
  }

  // 返回vnode节点
  createElement (tag, props, children) {
    return { tag, props, children }
  }

  // 创建真实dom元素
  createElm (vnode) {
    const { tag, props, children } = vnode
    const el = document.createElement(tag)
    // 判断是否有子项
    if (Array.isArray(children)) {
      children.forEach(child => {
        // 添加子元素
        el.appendChild(this.createElm(child))
      })
    } else {
      // 字符串形式
      el.textContent = children
    }
    // 在虚拟节点中保存下当前DOM元素
    vnode.el = el
    return el
  }
  // 更新节点
  _update (oldVnode, newVnode) {
    // 判断是否是元素节点
    if (oldVnode.nodeType) {
      const parent = oldVnode.parentElement // 获取当前节点的父级
      const nextSibling = oldVnode.nextSibling // 获取当前节点兄弟节点
      const el = this.createElm(newVnode)
      parent.insertBefore(el, nextSibling)
      parent.removeChild(oldVnode)
    } else {
      // 更新判断
      this._patch(oldVnode, newVnode)
    }
  }

  // 比较节点
  _patch (oldVnode, newVnode) {
    const el = newVnode.el = oldVnode.el // 获取上次的元素节点 赋值给新节点

    if (oldVnode.tag === newVnode.tag) {
      // 老的为文本节点的情况
      if (typeof oldVnode.children === 'string') {
        // 新节点为文本节点情况
        if (typeof newVnode.children === 'string') {
          // 判断当前节点不相同
          if (oldVnode.children !== newVnode.children) {
            el.textContent = newVnode.children
          }
        } else {
          // 当前新节点为数组节点 删除原节点 替换为子元素
          el.innerHTML = ''
          newVnode.children.forEach(child => {
            el.appendChild(this.createElm(child))
          })
        }
      } else {
        // 老节点为数组的情况
        if (typeof newVnode.children === 'string') { // 新节点字符串直接替换
          el.textContent = newVnode.children
        } else {
          // todo: diff Children 实现diff算法判断每个子元素是否可以复用 下面是暴力简易版本直接替换
          el.innerHTML = ''
          newVnode.children.forEach(child => {
            el.appendChild(this.createElm(child))
          })
        }
      }
    }
  }
}

// 定义watcher类 一对一动态属性
class Watcher {
  // 初始化传入 vm 实例子 updateFn 更新回调
  constructor (vm, updateFn) {
    this.vm = vm
    this.updateFn = updateFn
    // 初始化执行
    this.update()
  }

  // 提供给Dep调用的更新方法 ps: 直接获取当前最新的值
  update () {
    // 初始化watcher的时候 去读取下当前响应式key的值 触发defineReactive的get放入当前watcher对象 建立关系
    Dep.target = this
    this.getters()
    Dep.target = null
  }

  // 定义调用函数
  getters () {
    this.updateFn.call(this.vm)
  }
}


// 定义Dep类  一对多收集watcher依赖
class Dep {
  constructor () {
    this.deps = new Set()
  }
  // 添加对应watcher到队列中
  add (dep) {
    this.deps.add(dep)
  }
  // 通知更新所有的当前watchers
  notify () {
    this.deps.forEach(dep => dep.update())
  }
}