import markdownIt from 'markdown-it'
import 'github-markdown-css'

const base64_to_utf8 = (content) => {
  return decodeURIComponent(escape(atob(content)))
}

export default function ({ content }) {
  const md = new markdownIt({
    html: true,
    linkify: true
  })

  

  const str = md.render(base64_to_utf8(content))
  return (
    <div className="markdown-body">
      <div dangerouslySetInnerHTML={{ __html: str }} />
    </div>
  )
}