
// 初始化Vue对象
const Vue = {
  // 创建跨平台渲染器
  createRenderer ({
    querySelector,
    getNodeHTML,
    setNodeHTML,
    insertNode
  }) {
    // 返回创建App方法
    return {
      createApp (options) {
        return {
          mount (selector) {
            const parent = querySelector(selector)
            // 渲染视图
            if (!options.render) { // 没有的话去执行编译模版
              options.render = this.compile(getNodeHTML(parent))
            }
            // 处理数据： setup函数返回数据优先
            if (options.setup) {
              this.setupState = options.setup()
            }
            if (options.data) {
              this.data = options.data()
            }
            // 定义数据拦截
            this.proxy = new Proxy(this, {
              get (target, key) {
                if (key in target.setupState) {
                  return target.setupState[key]
                } else {
                  return target.data[key]
                }
              }
            })
            // 定义更新函数 执行挂载 包裹到副作用函数中  ps:effect在reactive.js中
            this.update = effect(() => {
              const el = options.render.call(this.proxy)
              setNodeHTML(parent, '')
              insertNode(el, parent)
            })
          },
          compile (template) {
            // 模拟下当前数据 返回渲染函数
            return function render () {
              const el = document.createElement('h2')
              el.textContent = this.msg
              return el
            }
          }
        }
      }
    }
  },
  // 定义创建App方法
  createApp (options) {
    // 创建当前平台渲染器 实现平台节点操作
    const renderer = this.createRenderer({
      querySelector: selector => document.querySelector(selector),
      getNodeHTML: el => el.innerHTML,
      setNodeHTML: (el, val)=> (el.innerHTML = val),
      insertNode (child, parent, anchor) {
        parent.insertBefore(child, anchor || null)
      }
    })
    // 调用渲染器创建app
    return renderer.createApp(options)
  }
}