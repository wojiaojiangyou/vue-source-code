import { isTracking, trackDeps, triggerDeps } from './effect'
import { isEqual, isObject } from '../share'
import { reactive } from './index'

class RefImpl {
  private _value: any
  private _raw: any // 保存原始对象
  private _deps: Set<any> // ref定义存储自己的依赖关系和effect类似

  constructor (value) {
    this._value = convert(value)
    this._raw = value
    this._deps = new Set()
  }

  get value () {
    
    trackRefDeps(this) // 调用追踪依赖

    return this._value
  }

  set value (newVal) {
    // 如果值相同就不处理 ps: 这边使用原始对象对比
    if (isEqual(this._raw, newVal)) return

    this._value = convert(newVal)
    this._raw = newVal
    // 执行当前依赖effect函数
    triggerDeps(this._deps)
  }
}

// 追踪ref依赖
function trackRefDeps (ref) {
  // 判断只有当前acttiveEffect的时候才添加依赖
  if (isTracking()) trackDeps(ref._deps)
}

// 转换响应式对象
function convert (val) {
  return isObject(val) ? reactive(val) : val
}

// 返回ref代理对象 因为基本值类型不能proxy代理 只能通过对象的get/set去代理实现
// 所以ref会有.value的实现
export function ref (value: any) {
  return new RefImpl(value)
}