import React, {
  useState,
  useReducer,
  useEffect,
  useLayoutEffect,
  useContext,
  useRef,
  useMemo,
  memo,
  useCallback
} from 'react'

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

/**
 * setName之后会重新渲染 MyCountFunc config会重新声明
 */
function MyCountFunc() {
  const [count, dispatchCount] = useReducer(countReducer, 0)
  const [name, setName] = useState('sunhangye')

  const countRef = useRef()
  countRef.current = count
  const config = useMemo(() => ({
    text: `count is ${count}`,
    color: count > 3 ? 'red' : 'blue'
  }), [count])

  // const handleButtonClick = useCallback(
  //   () => dispatchCount({type: 'add'}),
  //   []
  // )
  const handleButtonClick = useMemo(
    () => () => dispatchCount({type: 'add'}),
    []
  )

  /**
   * 每次都会销毁重新创建，因此导致 hooks 闭包问题
   * 解决：将值赋值到固定不变的 useRef()对象中，这样每次都是最新的
   */
  const handleAlertButtonClick = function () {
    setTimeout(() => {
      alert(countRef.current)
    }, 2000)
  }
  return (
    <div>
      <input type="text" value={name} onChange={e => setName(e.target.value)}/>
      <Child
        onButtonClick={handleButtonClick}
        config={config}
      />
      <button onClick={handleAlertButtonClick}>handleAlertButtonClick</button>
    </div>
  )
}

const Child = memo(function Child({ onButtonClick, config }) {
  console.log('child render')
  return (
  <button tyle="button" onClick={onButtonClick} style={{color: config.color}}>{config.text}</button>
  )
})

export default MyCountFunc

/**
 * 优化组件渲染
 * 1、使用memo包裹子组件
 * 2、使用userMemo包裹state
 * 3、使用useCallback包裹事件
 */

