import { reactive, isReactive, isProxy } from '../index'

describe('reactive', () => {
  it('init raw object', () => {
    const rawObj = { age: 1 }
    const obj = reactive(rawObj)

    expect(obj.age).toBe(1)
    expect(obj).not.toBe(rawObj)
  })

  it('is reactive', () => {
    const obj = {
      num: 1,
      user: {
        name: 'zhangsan',
        age: 12
      },
      jobs: [
        { title: '语文', score: 80 }
      ]
    }
    const robj = reactive(obj)
    expect(isReactive(robj)).toBe(true)
    expect(isReactive(obj)).toBe(false)
    expect(isReactive(robj.user)).toBe(true)
    expect(isReactive(robj.jobs)).toBe(true)
    expect(isReactive(robj.jobs[0])).toBe(true)

    expect(isProxy(robj)).toBe(true)
  })
})