import { track, trigger } from "./effect"
import { ReactiveFlags, reactive, readonly } from './index'
import { isObject, extend } from '../share'

// 优化提前创建好正常的处理get，set
const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)

function createGetter (isReadOnly = false, isShallow = false) {
  return function (target, key) {
    // 判断当前读取key的类型是 reactive、readyonly
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadOnly
    }

    const res = Reflect.get(target, key)
    
    // 判断是否只需要浅层监听
    if (isShallow) return res

    // 实现嵌套的响应式对象
    if (isObject(res)) {
      return isReadOnly ? readonly(res) : reactive(res)
    }

    // 依赖收集 ps: 只有不是只读的时候
    if (!isReadOnly) {
      track(target, key) 
    }

    return res
  }
}

function createSetter () {
  return function (target, key, value) {
    const res = Reflect.set(target, key, value)
    // 触发更新
    trigger(target, key)

    return res
  }
}

// 定义正常的key处理
export const normalHandler = { get, set }

// 定义只读key处理
export const readonlyHandler = {
  get: readonlyGet,
  set (target, key, value) {
    console.warn(`set ${key} is readyonly, do not set !`)
    return true
  }
}

// 定义浅层只读key的处理
export const shallowReadonlyHandler = extend({}, readonlyHandler, { get: shallowReadonlyGet })