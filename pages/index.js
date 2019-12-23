import { useEffect } from 'react'
import Link from 'next/link';
import { Button } from 'antd'
import Router from 'next/router'
import axios from 'axios'
import { request } from '../lib/api'
function Index() {


  const goDetail = () => {
    Router.push('/detail')
  }
  return (
    <>
      <h3>Index</h3>
      <Button onClick={goDetail}>跳转到detail页面</Button>
    </>
  )
}
Index.getInitialProps = async ({ ctx }) => {
  // const result = await request(
  //   {
  //     url: '/search/repositories?q=react',
  //   },
  //   ctx.req,
  //   ctx.res
  //   )

  // return {
  //   data: result.data
  // }
  
}

export default Index