'use client';

import { createContext, useContext, useEffect, useState } from 'react';

import {
  update_session,
  islogin,
  login,
  check_user_exist,
  cloud_remove_session,
  telegram_login
} from '../lib/ton_supabase_api'

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(null);

  async function anonymously_login() {
    try {
      // logout()
      // email_signUp('liuxuzhong5@ymyai.com','12345678')
      let time = new Date().getTime()
      console.log(`anonymously_login start time = ${time}`)
      let temp = await islogin()
      console.log(`islogin end time = ${time}, temp =`, temp)
      if (temp) {
        let user = null
        try {
          user = await check_user_exist(temp.id)
          // console.log('anonymously_login user = ',user)
        } catch (error) {
          console.log('anonymously_login user error = ',error)
        }
        if (!user) {
          // logout()
          await cloud_remove_session()
          temp = null
        }
      }
      if (!temp) {
        console.log(`login start time = ${time}`)
        const tg = window.Telegram && window.Telegram.WebApp;
        if (tg) {
          console.log('before telegram_login')
          temp = await telegram_login(tg)
        } else {
          let inviter_id = null
          let start_param = start_param_by_query;
          if (start_param) {
            const decodedText = Buffer.from(start_param, 'base64').toString('utf-8');
            const urlParams = new URLSearchParams(decodedText);
            const inviterId = urlParams.get('inviter_id');
            console.log('anonymously_login inviterId = ', inviterId)
            inviter_id = inviterId
          }
          temp = await login(inviter_id)
        }
        console.log(`login end time = ${time}`, temp)
        if (!temp) {
          return
        }
        // let ted = await get_session()
        console.log(`login end time ted = ${time}`)
        // if (isTelegramMiniAPP()) {
        //   let linked = await islinkTelegram()
        //   if (!linked) {
        //     await linkTelegramMiniAPP()
        //   }
        // }
      }
      // get_datas()
      setAuthState(true)
      console.log(`anonymously_login end time = ${new Date().getTime() - time}`)
    } catch (error) {
      console.log("anonymously_login error", error)
    } finally {
    }
  }

  const initializeTelegram = () => {
    if (window.Telegram) {
      const tg = window.Telegram.WebApp;
      console.log('tg.initData =', tg, tg.initData, tg.initDataUnsafe)
      // tg.enableDebugMode();
      tg.ready();
      // anonymously_login()
    }
  };

  useEffect(() => {
    if (!window.Telegram) {
      if (process.env.tg_mini_env == 'false') {
        // 开发环境的逻辑
        console.log("Running in development mode");
        // anonymously_login()
        return
      }
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-web-app.js';
      script.async = true;
      script.onload = () => initializeTelegram();
      document.head.appendChild(script);
    } else {
      initializeTelegram();
    }

    const subscription = update_session()
    console.log('AuthProvider useEffect subscription = ',subscription)

    // Cleanup listener on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={{authState}}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);