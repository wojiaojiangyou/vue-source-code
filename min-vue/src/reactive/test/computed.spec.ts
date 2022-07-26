
import { computed } from '../computed'
import { reactive } from '../index'

describe('computed', () => {
  it('happy path', () => {
    const a = reactive({ num: 1 })
    const getter = jest.fn(() => {
      return a.num
    })

    const b = computed(getter)

    // 初始化
    expect(getter).not.toHaveBeenCalled()
    expect(b.value).toBe(1)
    expect(getter).toHaveBeenCalledTimes(1)

    // 是否缓存执行数据
    b.value
    expect(getter).toHaveBeenCalledTimes(1)

    // 更改响应式数据 getter是否执行
    a.num = 2
    expect(getter).toHaveBeenCalledTimes(1)
    expect(b.value).toBe(2)
    expect(getter).toHaveBeenCalledTimes(2)
    
    // 当再次访问computed值的时候 getter方法不会触发
    b.value
    expect(getter).toHaveBeenCalledTimes(2)
  })
})