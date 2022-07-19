const effectStacks = [] // 定义存储当前更新函数栈 ps: 定义为数组的原因是因为effect函数有可能存在嵌套的情况
const targetMap = new WeakMap() // 定义存储收集依赖的weakmap

// 定义副作用函数
function effect(cb) {
  const fn = createEffectFunc(cb)
  fn()
  return fn
}

function createEffectFunc(cb) {
  return function () {
    try {
      effectStacks.push(cb)
      cb()
    } finally {
      effectStacks.pop() // 执行完当前更新函数退出栈
    }
  }
}

// 定义收集依赖函数
function track(target, key) {
  let curKeysMap = targetMap.get(target)
  // 判断是否收集了对象map
  if (!curKeysMap) {
    curKeysMap = new Map()
    targetMap.set(target, curKeysMap)
  }
  // 判断是否收集key对应的更新函数
  let curEffectsSet = curKeysMap.get(key)
  if (!curEffectsSet) {
    curEffectsSet = new Set()
    curKeysMap.set(key, curEffectsSet)
  }
  // 判断对列是否包含更新函数集合 有在添加对应的更新函数
  if (effectStacks.length) {
    const curEffect = effectStacks[effectStacks.length - 1]
    curEffectsSet.add(curEffect)
  }
}

// 定义触发更新更新函数
function trigger(target, key) {
  const curKeysMap = targetMap.get(target)
  const effects = curKeysMap.get(key)
  // 获取到对应的副作用函数执行
  effects.forEach(effect => effect())
}

// 定义响应式对象
function reactive(obj) {
  return new Proxy(obj, {
    get (target, key) {
      // 收集依赖
      track(target, key)
      // 判断获取的值是否对象类型 如果是需要在生成响应式对象
      return typeof target[key] === 'object' ? reactive(target[key]) : target[key]
    },
    set (target, key, val) {
      target[key] = val
      // 触发更新
      trigger(target, key)
    },
    deleteProperty (target, key) {
      delete target[key]
      // 触发更新
      trigger(target, key)
    }
  })
}
