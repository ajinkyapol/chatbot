import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './MessageContent.css'

// Renders assistant/user message text as Markdown (GFM: tables, code, lists, links).
// Links open in a new tab; long code blocks scroll horizontally (styled in CSS).
export const MessageContent = ({ content }) => {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: (props) => (
            <a target="_blank" rel="noopener noreferrer" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
