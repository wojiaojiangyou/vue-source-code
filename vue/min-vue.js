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
    // 编译模板
    new Compiler(options.el, this.vm)
  }
}

// 定义模版编译类
class Compiler {
  constructor (el, vm) {
    this.vm = vm 
    // 执行编译
    const dom = document.querySelector(el)
    this.compile(dom)
  }

  compile (el) {
    const childNodes = el.childNodes
    Array.from(childNodes).forEach(node => {
      if (this.isElement(node)) { // 元素节点
        const attributes = [...node.attributes]

        attributes.forEach(attr => {
          // 判断是否是指令语法属性
          if (this.isDirect(attr.name)) {
            const dirName = attr.name.substr(2) // v-text -> text
            this[dirName] && this[dirName](node, attr)
          }
        })
        // 判断是否有自己诶单进行递归判断
        if (node.childNodes) this.compile(node)
      } else if (this.isInsert(node)) { // 插入节点
        this.compileInserText(node)
      }
    })
  }

  // 定义通用更新函数 
  // node节点数据 exp: 绑定的表达式  dir:执行render dom更新方法
  update (node, exp, dir) {
    const renderMethod = 'render' + dir.substr(0, 1).toUpperCase() + dir.substr(1)
    const fn = this[renderMethod]
    // 初始化执行 
    fn && fn(node, this.vm[exp])
    // 对于所有动态属性添加watcher
    new Watcher(this.vm, exp, function (val) {
      fn && fn(node, val)
    })
  }

  // 定义v-text的处理
  text (node, attr) {
    this.update(node, attr.value, 'text')
  }

  renderText (node, val) {
    node.textContent = val
  }

  // 定义v-html的处理
  html (node, attr) {
    this.update(node, attr.value, 'html')
  }

  renderHtml (node, val) {
    node.innerHTML = val
  }

  // 编译动态属性 {{xxxx}}
  compileInserText (node) {
    this.update(node, RegExp.$1, 'text')
  }

  isDirect (name) {
    return name.startsWith('v-')
  }

  isElement (node) {
    return node.nodeType === 1 // 元素节点
  }

  isInsert (node) {
    return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent) // 匹配当前文本值
  }
}


// 定义watcher类 一对一动态属性
class Watcher {
  // 初始化传入 vm 实例子 key当前观察的key updateFn 更新回调
  constructor (vm, key, updateFn) {
    this.vm = vm
    this.key = key
    this.updateFn = updateFn
    // 初始化watcher的时候 去读取下当前响应式key的值 触发defineReactive的get放入当前watcher对象 建立关系
    Dep.target = this
    this.vm[this.key]
    Dep.target = null
  }

  // 提供给Dep调用的更新方法 ps: 直接获取当前最新的值
  update () {
    const val = this.vm[this.key]
    this.updateFn.call(this.vm, val)
  }
}


// 定义Dep类  一对多收集watcher依赖
class Dep {
  constructor () {
    this.deps = []
  }
  // 添加对应watcher到队列中
  add (dep) {
    this.deps.push(dep)
  }
  // 通知更新所有的当前watchers
  notify () {
    this.deps.forEach(dep => dep.update())
  }
}