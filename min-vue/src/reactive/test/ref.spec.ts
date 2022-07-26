import { ref, isRef, unRef, proxyRefs } from '../ref'
import { effect } from '../effect'
import { isReactive, reactive } from '../index'

describe('ref', () => {
  it('happy path', () => {
    const a = ref(1)
    expect(a.value).toBe(1)
  })

  it('effect set ref value', () => {
    const a = ref(1)
    let curNum;
    let callCount = 0
    effect(() => {
      callCount++
      curNum = a.value
    })
    // 初始化值正确
    expect(a.value).toBe(1)
    expect(curNum).toBe(1)
    expect(callCount).toBe(1)

    // 更新的时候值正确
    a.value = 2
    expect(a.value).toBe(2)
    expect(curNum).toBe(2)
    expect(callCount).toBe(2)

    // 再次赋值相同的时候
    a.value = 2
    expect(curNum).toBe(2)
    expect(callCount).toBe(2)
  })

  it('ref set reative value', () => {
    let a = ref({
      id: 1
    })

    let curId
    effect(() => {
      curId = a.value.id
    })
    expect(curId).toBe(1)
    expect(isReactive(a.value)).toBe(true)
    // 响应式对象更改值会变
    a.value.id = 2
    expect(curId).toBe(2)
  })

  it ('is ref', () => {
    const a = ref(1)
    const b = reactive({ a: 1 })
    expect(isRef(a)).toBe(true)
    expect(isRef(b)).toBe(false)
    expect(isRef(1)).toBe(false)
  })

  it('unref', () => {
    const a = ref(1)
    expect(unRef(a)).toBe(1)
    expect(1).toBe(1)
  })

  it ('proxyRefs', () => {
    const obj = {
      a: ref(1),
      b: 10
    }
    const proxyObj = proxyRefs(obj)

    expect(obj.a.value).toBe(1)
    expect(proxyObj.a).toBe(1)
    expect(proxyObj.b).toBe(10)
    
    // 设置普通值
    proxyObj.a = 10
    expect(obj.a.value).toBe(10)
    expect(proxyObj.a).toBe(10)

    // 替换ref值
    proxyObj.a = ref(20)
    expect(obj.a.value).toBe(20)
    expect(proxyObj.a).toBe(20)
  })
})