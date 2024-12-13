// "use client";
import localFont from "next/font/local";
import "./styles/globals.css";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// import { useEffect, useState } from 'react';




// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });
// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });

export const metadata = {
  title: "Appbase—engaging in Trial2Earn and redeeming rewards",  
  description: "Tens of millions of users are exploring different blockchain ecosystems on AppBase, engaging in Trial2Earn and redeeming rewards.",
  keywords: "AppBase, AppBase Online, AppBase Platform, Trial2Earn,Earn Rewards with Apps,TON Blockchain Apps,TON Mini-apps,Blockchain Rewards,Web3 Mini-apps,Earn with AppBase,App Aggregation Platform,App Rewards Program,Earn Crypto with Apps,TON Blockchain Community,Airdrop Rewards,Explore Apps and Earn,Play to Earn,Mini-app Platform,Blockchain Airdrops,AppBase Rewards System,AppBase Features,Web3 App Directory,AppBase Mini-apps,Blockchain Ecosystem,App Discovery Platform,Crypto Airdrop Programs,AppBase Community,AppBase TON Ecosystem,Discover New Apps,Blockchain Application Hub,Earn Points on AppBase,AppBase TON Blockchain,AppBase Rewards Hub,AppBase Engagement,Explore and Earn Platform,"
};


import { AuthProvider } from './auth_provider';


export default function RootLayout({ children }) {

  return (
    <html lang="en">
      {/* <head>
        <link rel="icon" href="/images/favicon.ico" />
      </head> */}
      <body>
        <AuthProvider>{children}</AuthProvider>
        <ToastContainer position="top-right" autoClose={3000} />
      </body>
    </html>
  );
}
