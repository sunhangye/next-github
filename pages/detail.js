function Detail() {
  return (<h3>Detail</h3>)
}
Detail.getInitailProps = () => {
  return new Promise((reolve) => {
    setTimeout(() => {
      reolve({})
    }, 10000)
  })
}
export default Detail