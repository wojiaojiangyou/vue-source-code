import { shallowReadonly, isReadyOnly } from '../index'

describe('shallow readonly', () => {
  it('readonly get', () => {
    // mock warning方法 ps: jest里模拟warn方法调用
    console.warn = jest.fn()

    const obj = {
      num: 1,
      user: {
        name: 'zhangsan',
        age: 20
      }
    }
    const robj = shallowReadonly(obj)
    expect(obj).not.toBe(robj)

    expect(isReadyOnly(robj)).toBe(true)
    expect(isReadyOnly(robj.user)).toBe(false)
  })

  it('readonly set', () => {
    // mock warning方法 ps: jest里模拟warn方法调用
    console.warn = jest.fn()

    const obj = {
      num: 1,
      user: {
        name: 'zhangsan',
        age: 20
      }
    }
    const robj = shallowReadonly(obj)
    
    robj.num = 2
    expect(console.warn).toHaveBeenCalled()
  })
})