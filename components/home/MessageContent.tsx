import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

export default function MessageContent({
  messageContent,
}: {
  messageContent: any;
}) {
  return (
    <ReactMarkdown
      components={{
        ul: ({ children }) => <ul className="list-disc ml-6">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal ml-6">{children}</ol>,
        // TODO: Add support for providing alt text for images
        img: (props) => (
          <img className="max-w-4xl" alt="Attachment" {...props}></img>
        ),
        a: (props) => (
          <>
            <a
              data-tooltip-id="link-id"
              data-tooltip-place="top"
              data-tooltip-content={`${props.href}`}
              className="text-frost-300"
              {...props}
            >
              {props.children}
            </a>
          </>
        ),
        h1: (props) => <h1 className="text-2xl font-bold" {...props}></h1>,
        h2: (props) => <h2 className="text-xl font-bold" {...props}></h2>,
        h3: (props) => <h3 className="text-lg font-bold" {...props}></h3>,
        h4: (props) => <h4 className="text-base font-bold" {...props}></h4>,
        h5: (props) => <h5 className="text-sm font-bold" {...props}></h5>,
        h6: (props) => <h6 className="text-xs font-bold" {...props}></h6>,
        table: (props) => <table className="table-auto" {...props}></table>,
        thead: (props) => <thead className="bg-grey-800" {...props}></thead>,
        tbody: (props) => <tbody className="bg-grey-700" {...props}></tbody>,
        tr: (props) => (
          <tr className="border-b border-grey-600" {...props}></tr>
        ),
        th: (props) => <th className="px-4 py-2" {...props}></th>,
        td: (props) => <td className="px-4 py-2" {...props}></td>,
        blockquote: (props) => (
          <blockquote
            className="border-l-4 border-grey-600 pl-4"
            {...props}
          ></blockquote>
        ),
      }}
      rehypePlugins={[
        [rehypeHighlight, { detect: false, ignoreMissing: true }],
        [rehypeKatex, { strict: false, output: 'mathml' }],
      ]}
      remarkPlugins={[
        [
          remarkGfm,
          {
            singleTilde: false,
            tableCellPadding: false,
            tablePipeAlign: false,
          },
        ],
        [remarkMath],
        [remarkBreaks],
      ]}
    >
      {messageContent}
    </ReactMarkdown>
  );
}
