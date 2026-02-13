import { Footer } from '@ugrc/utah-design-system/src/components/Footer';
import { Header } from '@ugrc/utah-design-system/src/components/Header';
import { FirebaseAnalyticsProvider } from '@ugrc/utah-design-system/src/contexts/FirebaseAnalyticsProvider';
import { FirebaseAppProvider } from '@ugrc/utah-design-system/src/contexts/FirebaseAppProvider';
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Logo from './logo.jpg';

const links = [
  { key: 'Utah Broadband Center', action: { url: 'https://connecting.utah.gov' } },
  {
    key: 'FCC National Broadband Map',
    action: { url: 'https://broadbandmap.fcc.gov' },
  },
];

const Address = () => (
  <div className="order-last col-span-1 justify-center text-center sm:col-span-3 md:order-first md:col-span-2 md:justify-self-start md:text-start">
    <div>
      <div className="max-w-xs">
        <img src={Logo} alt="broadband logo" />
      </div>
      <div className="mt-4 text-lg">
        <p>Utah Broadband Center</p>
        <p className="text-sm">A Division of Utah Department of Transportation</p>
      </div>
      <address className="mt-2 text-sm not-italic">
        <p>Calvin Rampton Building</p>
        <p>4501 S 2700 W</p>
        <p>Taylorsville, Utah 84129</p>
      </address>
      <p className="mt-2 text-sm">Hours: Monday - Friday, 8:00 AM - 5:00 PM</p>
    </div>
  </div>
);

const columnOne = {
  title: 'Navigation Menu',
  links: [
    {
      title: 'Home',
      url: 'https://connecting.utah.gov',
    },
    {
      title: 'Internet Speed Test',
      url: 'https://connecting.utah.gov/speed-test/',
    },
    {
      title: 'News',
      url: 'https://connecting.utah.gov/news/',
    },
    {
      title: 'Contact',
      url: 'https://connecting.utah.gov/contact/',
    },
    {
      title: 'Events',
      url: 'https://connecting.utah.gov/#:~:text=Contact-,Events,-Close%20search%20modal',
    },
  ],
};

const columnTwo = {
  title: 'About',
  links: [
    {
      title: 'Maps',
      url: 'https://connecting.utah.gov/maps/',
    },
    {
      title: 'Utah Broadband Advisory Commission',
      url: 'https://connecting.utah.gov/advisory-commission/',
    },
    {
      title: 'Utah Broadband Providers',
      url: 'https://connecting.utah.gov/providers/',
    },
  ],
};

const columnThree = {
  title: 'Grants',
  links: [
    {
      title: 'Broadband Access Grant',
      url: 'https://connecting.utah.gov/grants/bag/',
    },
    {
      title: 'Broadband Infrastructure Grant (BIG)',
      url: 'https://connecting.utah.gov/grants/big/',
    },
  ],
};

let url = 'https://arcg.is/04i8Hj1';
if (import.meta.env.MODE !== 'production') {
  url += '?draft=true';
}

let firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
  measurementId: '',
};

if (import.meta.env.VITE_FIREBASE_CONFIG) {
  firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG);
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FirebaseAppProvider config={firebaseConfig}>
      <FirebaseAnalyticsProvider>
        <main className="flex h-screen flex-col">
          <Header links={links}>
            <div className="flex h-full grow items-center gap-3">
              <img src={Logo} alt="broadband logo" className="h-14" />
              <h2 className="font-heading text-2xl font-black text-zinc-600 sm:text-3xl lg:text-4xl xl:text-5xl dark:text-zinc-100">
                Utah Residential Broadband Map
              </h2>
            </div>
          </Header>
          <iframe
            id="main-content"
            className="m-0 flex-1 overflow-hidden border-none p-0"
            title="Broadband Map"
            allowFullScreen
            src={url}
          ></iframe>
        </main>
        <Footer
          renderAddress={() => <Address />}
          columnOne={columnOne}
          columnTwo={columnTwo}
          columnThree={columnThree}
        />
      </FirebaseAnalyticsProvider>
    </FirebaseAppProvider>
  </React.StrictMode>,
);
