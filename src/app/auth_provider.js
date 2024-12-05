'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter,usePathname,useSearchParams } from 'next/navigation';



import {
  update_session,
  islogin,
  login,
  check_user_exist,
  cloud_remove_session,
  telegram_login
} from '../lib/ton_supabase_api'

// import eruda from 'eruda';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();  
  // const searchParams = useSearchParams();
  console.log('AuthProvider in =',pathname)


  const [authState, setAuthState] = useState(null);
  const [start_param_by_query, set_start_param_by_query] = useState(null)


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
          const tg = window.Telegram && window.Telegram.WebApp;
          if (tg) {
            // console.log('anonymously_login initDataUnsafe = ',tg.initDataUnsafe)
            let query_id = tg.initDataUnsafe && tg.initDataUnsafe.user.id
            // query_id = 12345555
            // console.log('anonymously_login query_id = ',query_id,user.identity.provider_id)
            let provider_id = user && user.identity && user.identity.provider_id
            
            console.log('anonymously_login query_id = ',query_id, provider_id,tg.initDataUnsafe.user.id,user)
            if (query_id != provider_id) {
              // tg.showAlert(`query_id = ${query_id},tg.initDataUnsafe.user.id = ${tg.initDataUnsafe.user.id},provider_id = ${provider_id},user = ${user.id} = ${temp.id}`);
              user = null
            }
          }
          // console.log('anonymously_login user = ',user)
        } catch (error) {
          console.log('anonymously_login user error = ',error)
        }
        if (!user) {
          // logout()
          try {
            await cloud_remove_session()
          } catch (error) {
            console.log('anonymously_login cloud_remove_session error = ',error)
          }
         
          temp = null
        }
      }
      // const tg = window.Telegram && window.Telegram.WebApp;
      // tg.showPopup({
      //   title: "登录前",
      //   message: `user =  ${temp && temp.id}`,
      //   buttons: [{ text: "Done" }]
      // });
      if (!temp) {
        console.log(`login start time = ${time}`)
        const tg = window.Telegram && window.Telegram.WebApp;
        const flag = tg && tg.initData && tg.initData.length
        if (tg && flag) {
          console.log('before telegram_login')
          temp = await telegram_login(tg)
          // tg.showPopup({
          //   title: "登录后",
          //   message: JSON.stringify(temp),
          //   buttons: [{ text: "Done" }]
          // });
        } else {
          let inviter_id = null
          let start_param = start_param_by_query;
          console.log('start_param = ',start_param)
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

  const initializeTelegram = async () => {
    
    if (window.Telegram) {
      const tg = window.Telegram && window.Telegram.WebApp;
      tg.ready();
      const initData = window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData;
      const flag = initData && initData.length
      console.log('initializeTelegram provider = ',tg,flag,router)
      if (process.env.tg_mini_env == 'true' && !flag) {
        console.log('initializeTelegram provider = notInMiniapp ',tg,initData,router)
        if (pathname === '/twitter') {
          return
        }
        //todo 跳转到 报错页面
        router.replace(`/notInMiniapp`)
        return
      }
      console.log('tg.initData =', tg, tg.initData, tg.initDataUnsafe)
      // tg.enableDebugMode();
      // tg.ready();
      await anonymously_login()
    }
  };

  // useEffect(() => {
  //   console.log('useEffect provider startapp in = ',searchParams)
  //   const value_ = searchParams.get('startapp')
  //   set_start_param_by_query(value_)
  // }, [searchParams])

  useEffect(() => {
    console.log('useEffect provider in = ', window.Telegram)

    // const erudaScript = document.createElement('script');
    //   erudaScript.src = 'https://cdn.jsdelivr.net/npm/eruda';
    //   erudaScript.onload = () => {
    //     eruda.init(); // 初始化 Eruda
    //   };
    //   document.body.appendChild(erudaScript);

    const params = new URLSearchParams(window.location.search);
    const startapp = params.get('startapp');
    console.log('useEffect provider startapp =',startapp,window.location)
    if (startapp) {
      set_start_param_by_query(startapp)
    }

    if (!window.Telegram) {
      if (process.env.tg_mini_env == 'false') {
        // 开发环境的逻辑
        console.log("Running in development mode");
        anonymously_login()
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

    console.log('useEffect provider out = ', window.Telegram)

    // const subscription = update_session()
    // console.log('AuthProvider useEffect subscription = ',subscription)

    // // Cleanup listener on unmount
    // return () => {
    //   subscription?.unsubscribe();
    // };
  }, []);

  return <AuthContext.Provider value={{authState}}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);