import { Footer, Header } from '@ugrc/utah-design-system';
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Logo from './logo.jpg';

const links = [
  { key: 'Utah Broadband Center', action: { url: 'https://broadband.utah.gov' } },
  {
    key: 'FCC National Broadband Map',
    action: { url: 'https://broadbandmap.fcc.gov' },
  },
];

const Address = () => (
  <address className="not-italic">
    <p>Utah Broadband Center</p>
    <p>UEN 8756</p>
    <p>875 South 200 West</p>
    <p>Salt Lake City, UT 84101</p>
  </address>
);

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <main className="flex h-screen flex-col">
      <Header links={links}>
        <div className="flex h-full grow items-center gap-3">
          <img src={Logo} alt="broadband logo size-4" />
          <h2 className="font-heading text-2xl font-black text-zinc-600 sm:text-3xl lg:text-4xl xl:text-5xl dark:text-zinc-100">
            Utah Residential Broadband Map
          </h2>
        </div>
      </Header>
      <iframe
        className="m-0 flex-1 overflow-hidden border-none p-0"
        title="Broadband Map"
        allowFullScreen
        src="https://arcg.is/04i8Hj1"
      ></iframe>
    </main>
    <Footer renderAddress={() => <Address />} />
  </React.StrictMode>,
);
