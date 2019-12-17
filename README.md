https://blog.csdn.net/weixin_33737134/article/details/91438412
https://juejin.im/post/5d5a54f0e51d4561af16dd19#heading-5

Hooks 让函数组件具有类组件的能力

单向数据流状态管理工具
redux-thunk

Math.round() 根据“round”的字面意思“附近、周围”，可以猜测该函数是求一个附近的整数，即四舍五入
Math.ceil() 根据“ceil”的字面意思“天花板”去理解 往上取整
Math.floor()：根据“floor”的字面意思“地板”去理解 往下取整

### nextjs集成react-redux

```
WithReduxApp.getInitialProps = async (ctx) => {
  ...
  // 将reduxStore赋值到ctx
  ctx.reduxStore = reduxStore

  ...
}
```

### Hooks 让函数组件具有类组件的能力