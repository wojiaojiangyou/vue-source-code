import { normalHandler, readonlyHandler, shallowReadonlyHandler } from './baseHandler'

// 定义枚举类型
export enum ReactiveFlags {
  IS_REACTIVE = '_v_isReactive',
  IS_READONLY = '_v_isReadonly'
}


function createProxy (target, handler) {
  return new Proxy(target, handler)
}

// 创建响应式数据
export function reactive (raw) {
  return createProxy(raw, normalHandler)
}

// 创建只读响应式数据
export function readonly (raw) {
  return createProxy(raw, readonlyHandler)
}

// 创建浅层只读响应式数据
export function shallowReadonly (raw) {
  return createProxy(raw, shallowReadonlyHandler)
}


// 判断是否是reactive ps: 如果没有触发get定义普通返回会undefined 直接转换boolean
export function isReactive (raw) {
  return !!raw[ReactiveFlags.IS_REACTIVE]
}

// 判断是否是readyobly ps: 如果没有触发get定义普通返回会undefined 直接转换boolean
export function isReadyOnly (raw) {
  return !!raw[ReactiveFlags.IS_READONLY]
}

// 判断是否通过reactive、readonly创建出来的响应式对象
export function isProxy (raw) {
  return isReactive(raw) || isReadyOnly(raw)
}