import React, { useState, useReducer, useEffect, useLayoutEffect, useContext, useRef } from 'react'

import MyContext from '../lib/my-context'

class MyCount extends React.Component {
  constructor(props) {
    super(props)
    this.refInput = React.createRef()
    console.log(this.refInput.current);
    
  }
  componentWillMount() {

  }
  componentWillUnmount() {

  }

  render() {
    return (
    <div>
      <span ref={this.refInput}>haha</span>
    </div>
  )
  }
}


function countReducer(state, action) {
  switch (action.type) {
    case 'add':
      return state + 1
    case 'minus':
      return state - 1
    default:
      return state;
  }
}

function MyCountFunc() {
  /**
   * 状态管理两种方式 useState useReducer
   */
  // const [count, setCount] = useState(0)

  const [count, dispatchCount] = useReducer(countReducer, 0)
  const [name, setName] = useState('sunhangye')

  const context = useContext(MyContext)
  const inputRef = useRef()

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     // setCount(c => c + 1)
  //     dispatchCount({type: 'add'})
  //   }, 1000)
  //   return () => clearInterval(interval)
  // }, [])
  /**
   * useEffect dom树更新之后执行 useEffect
   * 第一个参数 相当于componentWillMount, return componentDidMount
   * 第二个参数[] 依赖注入 返回空,不执行依赖卸载。 如果传name 保存上次的name每次都WillMount、 DidMount
   * 所以推荐只要外部用到的state或者func都要填到第二个参数[] dependency 从而从新执行useEffect
   */


  useEffect(() => {
    console.log(inputRef)
    console.log('effect invoked')
    return console.log('effect deteched')
    
    
  }, [name, count])
  /**
   * dom树更新之前执行useLayoutEffect
   */
  useLayoutEffect(() => {
    console.log('layouteffect invoked')
    return console.log('layouteffect deteched')
  }, [name, count])
  return (
    <div>
      <input ref={inputRef} type="text" value={name} onChange={e => setName(e.target.value)}/>
      <br/>
      <button onClick={() => dispatchCount({type: 'add'})} >{count}</button>
      <p>{context}</p>
    </div>
  )
}

export default MyCountFunc