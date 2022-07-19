import { reactive } from '../index'
import { effect, stop } from '../effect'

describe('effect', () => {
  it('init & update', () => {
    const obj = reactive({ num: 1 })
    let curNum;
    // 监听副作用
    effect(() => {
      curNum = obj.num + 1
    })
    expect(curNum).toBe(2)

    // 更新
    obj.num++
    expect(curNum).toBe(3)
  })

  it('return runner function value', () => {
    let num = 0
    const runner = effect(() => {
      num++

      return 'callback value'
    })

    expect(num).toBe(1)
    // 执行effect返回的当前的更新函数
    const val = runner()
    expect(val).toBe('callback value')
  })

  it('schedule function call', () => {
    let curNum = 0
    let curRunner
    const obj = reactive({ num: 1 })
    // 定义调度方法
    const schedule = jest.fn(() => {
      curRunner = runner
    })
    // 传入当前调度方法
    const runner = effect(() => {
      curNum = obj.num
    }, { schedule })
    
    expect(curNum).toBe(1)
    expect(schedule).not.toHaveBeenCalled() // 第一次不会调用

    // 更新依赖调用调度方法 值依然为1
    obj.num++
    expect(schedule).toHaveBeenCalledTimes(1)
    expect(curNum).toBe(1)
    // 调用当前更新函数
    curRunner()
    expect(curNum).toBe(2)
  })


  it('stop func call', () => {
    let curNum = 0
    const obj = reactive({ num: 1 })
    const runner = effect(() => {
      curNum = obj.num
    })
    obj.num = 2
    expect(curNum).toBe(2)
    // 调用停止当前更新函数
    stop(runner)
    obj.num = 3
    expect(curNum).toBe(2)
    // 调用更新
    runner()
    expect(curNum).toBe(3)
  })

  it('onStop func call', () => {
    let curNum = 0
    const obj = reactive({ num: 1 })
    const onStop = jest.fn(() => {
      curNum = 10
    })
    const runner = effect(() => {
      curNum = obj.num
    }, { onStop })

    expect(curNum).toBe(1)
    obj.num = 2
    expect(curNum).toBe(2)
  
    stop(runner)
    expect(onStop).toHaveBeenCalledTimes(1) // 会调用一次
    obj.num = 3
    expect(curNum).toBe(10)
  })
})