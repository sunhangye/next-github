import { withRouter } from 'next/router'

const Search = ({router}) => {
  return (
  <span>{router.query.query}</span>
  )
}

export default withRouter(Search)