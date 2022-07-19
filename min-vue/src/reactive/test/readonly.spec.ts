import { readonly, isReadyOnly, isProxy } from '../index'

describe('readonly', () => {
  it('readonly', () => {
    // mock warning方法 ps: jest里模拟warn方法调用
    console.warn = jest.fn()

    const obj = { num: 1 }
    const robj = readonly(obj)
    expect(obj.num).toBe(1)
    expect(obj).not.toBe(robj)
    robj.num++
    expect(console.warn).toHaveBeenCalled()
  })

  it('is readonly', () => {
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
    const robj = readonly(obj)
    expect(isReadyOnly(robj)).toBe(true)
    expect(isReadyOnly(obj)).toBe(false)

    expect(isReadyOnly(robj.user)).toBe(true)
    expect(isReadyOnly(robj.jobs)).toBe(true)
    expect(isReadyOnly(robj.jobs[0])).toBe(true)

    expect(isProxy(robj)).toBe(true)
  })
})