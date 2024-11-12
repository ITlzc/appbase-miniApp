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
  title: "AppBase",
  description: "",
};



// import {
//   islogin,
//   login,
//   get_session
// } from '../utils/supabase/server'

// import {createClient} from '../utils/supabase/server-props'

// export async function getServerSideProps(context) {
//   const supabase = createClient(context)

//   const { data, error } = await supabase.auth.getUser()

//   if (error || !data) {
//     return {
//       redirect: {
//         destination: '/',
//         permanent: false,
//       },
//     }
//   }

//   return {
//     props: {
//       user: data.user,
//     },
//   }
// }

export default function RootLayout({ children }) {


  // function isTelegramMiniAPP() {
  //   if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) {
  //     return true
  //   }
  //   return false
  // }

  // /**
  //  * 绑定telegram 小程序。
  //  *
  //  * @returns {string} 返回值。
  //  */
  // async function linkTelegramMiniAPP() {
  //   try {
  //     if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) {
  //     let temp = await call_eage_function('telegram_miniapp_provider',{
  //       initData:window.Telegram.WebApp.initData
  //     })
  //     if (temp && temp.valid) {
  //       return true
  //     }
  //     return false
  //     }
  //   } catch (error) {
  //     console.log("linkTelegramMiniAPP = ",error)
  //     throw error
  //   }
  // }

  // /**
  //  * 是否绑定telegram。
  //  *
  //  * @returns {string} 返回值。
  //  */
  // async function islinkTelegram() {
  //   const { data, error } = await supabase.functions.invoke('check_telegram_provider', {
  //     method:"GET"
  //   })
  //   console.log(`check_telegram_provider:`, data,error);
  //   if (error) throw error
  //   if (data && data.exist) {
  //     return data
  //   }
  //   return null
  // }
  
  // async function anonymously_login() {
  //   try {
  //     let time = new Date().getTime()
  //     console.log(`anonymously_login start time = ${time}`)
  //     let temp = await islogin()
  //     console.log(`islogin end time = ${time}, temp =`, temp)
  //     if (!temp) {
  //       console.log(`login start time = ${time}`)
  //       temp = await login()
  //       console.log(`login end time = ${time}`,temp)
  //       if (!temp) {
  //         return
  //       }
  //       // let ted = await get_session()
  //       console.log(`login end time ted = ${time}`)
  //       // if (isTelegramMiniAPP()) {
  //       //   let linked = await islinkTelegram()
  //       //   if (!linked) {
  //       //     await linkTelegramMiniAPP()
  //       //   }
  //       // }
  //     }
  //     console.log(`anonymously_login end time = ${new Date().getTime() - time}`)
  //   } catch (error) {
  //     console.log("anonymously_login error", error)
  //   } finally {
  //   }
  // }
  // anonymously_login()

  // useEffect(() => {
  //   console.log('layout useEffect in')
  //   anonymously_login()
  //   console.log('layout useEffect out')
  // }, [])

  return (
    <html lang="en">
      <body>
        {children}
        <ToastContainer position="top-right" autoClose={3000} />
      </body>
    </html>
  );
}
