import { ReactiveEffect } from './effect'

class ComputedRefImpl {
  private getter: Function // 执行的function
  private effect: ReactiveEffect // 定义effect执行函数
  private _cache: boolean = false // 缓存值状态
  private _value: any // 保存执行的值

  constructor (getter) {
    this.getter = getter
    // 实例化effect对象
    this.effect = new ReactiveEffect(getter)
    // 定义effect调度方法 当内部响应式数据更新后触发 把缓存状态重置
    this.effect.schedule = () => {
      if (this._cache) this._cache = false
    }
  }

  get value () {
    // 判断是否需要缓存值
    if (!this._cache) {
      this._cache = true
      this._value = this.effect.run()
    }

    return this._value
  }
}

// 计算属性方法
export function computed (getter) {
  return new ComputedRefImpl(getter)
}