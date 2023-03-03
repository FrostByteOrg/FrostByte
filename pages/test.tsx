import { useEffect, useState } from 'react';

export default function Test() {
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/hackermare/BD-AutoScroll/edc48198d53c4a6d611588bab9dba05c37ad8158/AutoScroll.plugin.js')
      .then((response) => response.text()
        .then((text) => {
          setContent(text);
        })
      );
  }, []);


  return <div>{content}</div>;
}
