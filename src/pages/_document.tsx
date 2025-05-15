import { Head, Html, Main, NextScript } from 'next/document'
import Script from 'next/script'
import { defaultThemeState } from '../states/themeState'

const fathom = 'DFOUG'

export default function Document() {
  return (
    <Html lang="en" data-theme="light">
      <Head>
        <script
          dangerouslySetInnerHTML={{
            __html: `var main=function(){try{var t=JSON.parse(localStorage.getItem("theme")||"{}"),e=(null==t?void 0:t.mode)||${defaultThemeState.mode},a=(null==t?void 0:t.genericFontFamily)||${defaultThemeState.genericFontFamily},i=document.querySelector("html");i.setAttribute("data-theme",e),i.setAttribute("data-font-family",a)}catch(n){}};main();`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(f, a, t, h, o, m){
              a[h]=a[h]||function(){
                (a[h].q=a[h].q||[]).push(arguments)
              };
              o=f.createElement('script'),
              m=f.getElementsByTagName('script')[0];
              o.async=1; o.src=t; o.id='fathom-script';
              m.parentNode.insertBefore(o,m)
            })(document, window, '//fathom.bi.status.im/tracker.js', 'fathom');
            fathom('set', 'siteId', '${fathom}');
            fathom('trackPageview');`,
          }}
        />
      </Head>

      <body>
        <Script
          strategy="afterInteractive"
          src="https://umami.bi.status.im/script.js"
          data-website-id="6f59ea55-4079-4093-bfa2-a56eee2ff1ac"
          data-domains="press.logos.co"
          data-exclude-hash="true"
        />
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
