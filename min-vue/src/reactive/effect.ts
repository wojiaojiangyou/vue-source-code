import { extend } from '../share/index'

let activeEffect: ReactiveEffect | null  = null // 当前执行的副作用
let shouldTrack: boolean = true // 当前是否需要添加追踪(依赖)

// 清除当前effect
function cleanupEffect (effect: any) {
  effect.deps.forEach(dep => {
    dep.delete(effect)
  })
  effect.deps.length = 0
}

// 定义更新函数存储对象
class ReactiveEffect {
  public deps: ReactiveEffect[] = [] // 存储依赖
  public onStop: Function | undefined  = undefined // 定义stop函数的前置调用
  public schedule: Function | undefined  = undefined // 存储更新调度方法
  private active: boolean = true // 是否已经激活
  private _fn: Function // 存储更新函数

  constructor (fn) {
    this._fn = fn
  }

  run () {
    // 停止状态的时候 只有函数的返回值返回
    if (!this.active) {
      return this._fn()
    }
    shouldTrack = true // 应该需要追踪
    activeEffect = this // 存储当前运行实例

    const result = this._fn() // 返回当前执行函数的值
    shouldTrack = false // 执行完毕后关闭追踪

    return result
  }
  // 停止更新方法 active为了优化防止每次调用都去遍历
  stop () {
    if (this.active) {
      this.onStop && this.onStop()  // 是否有stop回掉
      cleanupEffect(this)
      this.active = false
    }
  }
}

// 定义收集函数
const targetMap = new Map()
export function track (target, key) {
  // 如果不需要追踪的时候就直接返回
  if (!isTracking()) return

  let depsMap = targetMap.get(target)

  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  let depSet = depsMap.get(key)
  if (!depSet) {
    depSet = new Set()
    depsMap.set(key, depSet)
  }
  // 添加依赖 ps: 不用做重复添加
  if (depSet.has(activeEffect)) return
  // 添加追踪依赖
  trackDeps(depSet)
}

// 收集deps依赖
export function trackDeps (depSet) {
  depSet.add(activeEffect)
  // 这边存储下所有依赖key的effect的deps
  activeEffect!.deps.push(depSet)
}

// 判断当前是否需要追踪以来
export function isTracking () {
  return shouldTrack && activeEffect
}

// 定义触发函数
export function trigger (target, key) {
  const depsMap =  targetMap.get(target)
  const depSet = depsMap.get(key)
  // 循环函数执行
  triggerDeps(depSet)
} 

// 执行依赖函数
export function triggerDeps (depSet) {
  for (let effect of depSet) {
    // 判断是否有调度方法
    if (effect.schedule) {
      effect.schedule()
    } else {
      effect.run()
    }
  }
}

// 副作用函数
type OptionsProps = {
  schedule?: () => void
  onStop?: () => void
}
export function effect (fn, options: OptionsProps = {}) {
  const _effect = new ReactiveEffect(fn)
  _effect.run()
  // 继承options
  extend(_effect, options)
  // 修正当前this返回run的更新函数 ps: this修正是为了保证activeEffect指向正确
  const runner: any = _effect.run.bind(_effect)
  // 在run方法挂载reactiveEffect实例
  runner.effect = _effect
  // 返回
  return runner
}

// 停止副作用函数调用
export function stop (runner: any) {
  runner.effect.stop() // 调用挂在的实例的方法
}