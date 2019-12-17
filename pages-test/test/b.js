import { withRouter } from 'next/router';
import router from 'next/dist/client/router';
import Link from 'next/link';
const B = ({router}) => <Link href="#hello"><p>this is test/b page参数是{router.query.id}</p></Link>

export default withRouter(B)