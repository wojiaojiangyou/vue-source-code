// 定义继承函数
export const extend = Object.assign

// 判断是否时对象函数
export const isObject = (val) => {
  return val !== undefined && typeof val === 'object'
}

// 判断是否相等
export const isEqual = (val, newVal) => {
  return Object.is(val, newVal)
}