import markdownIt from 'markdown-it'
import 'github-markdown-css'

const base64_to_utf8 = (content) => {
  return decodeURIComponent(escape(atob(content)))
}

export default function ({ content, isBase64 }) {
  const md = new markdownIt({
    html: true,
    linkify: true
  })

  const str = isBase64 ? base64_to_utf8(content) : content
  return (
    <div className="markdown-body">
      <div dangerouslySetInnerHTML={{ __html: md.render(str) }} />
    </div>
  )
}