import { Select, Spin } from 'antd'
import { useState, useCallback, useRef } from 'react'
import debounce from 'lodash/debounce'
import api from '../lib/api'

const { Option } = Select


function SearchUser({ onChange, value }) {
  const [fetching, setFetching] = useState(false)
  const [options, setOptions] = useState([])
  // { current: 0 }
  const lastFetchIdRef = useRef(0)
  
  const fetchUser = useCallback(debounce(value => {
    setFetching(true)
    setOptions([])
    lastFetchIdRef.current += 1
    const fetchId = lastFetchIdRef.current
    api.request({
      url: `/search/users?q=${value}`
    }).then(resp => {
      if (fetchId !== lastFetchIdRef.current) {
        return
      }
      const data = resp.data.items.map(user => ({
        text: user.login,
        value: user.login,
      }))

      setFetching(false)
      setOptions(data)
    })

  }, 500), [fetching, options])

  const handleChange = (selectValue) => {
    onChange(selectValue)
    setOptions([])
  }
  return (
    <Select
      style={{width: 200}}
      showSearch={true}
      notFoundContent={fetching ? <Spin size="small" /> : (<span>not found</span>)}
      // 禁用本地搜索
      filterOption={false}
      placeholder="创建者"
      allowClear={true}
      onSearch={fetchUser}
      onChange={handleChange}
    >
      {
        options.map(opt => (
          <Option key={opt.value} value={opt.value}>{opt.text}</Option>
        ))
      }
    </Select>
  )
}

export default SearchUser