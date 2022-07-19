import { ref } from '../ref'
import { effect } from '../effect'
import { isReactive } from '../index'

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
})