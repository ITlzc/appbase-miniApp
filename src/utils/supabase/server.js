// import { type GetServerSidePropsContext } from 'next'
import { createServerClient, serializeCookieHeader } from '@supabase/ssr'
// import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

import {supabaseUrl,supabaseKey} from './config'


export async function createClient() {
    const cookieStore = await cookies()

    const supabase = createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    )
                    } catch {
                    // The `setAll` method was called from a Server Component.
                    // This can be ignored if you have middleware refreshing
                    // user sessions.
                    }
                },
            },
        }
    )

  return supabase
}

// export async function getServerSideProps(context) {
//     const supabase = createClient(context)
  
//     const { data, error } = await supabase.auth.getUser()
  
//     if (error || !data) {
//       return {
//         redirect: {
//           destination: '/',
//           permanent: false,
//         },
//       }
//     }
  
//     return {
//       props: {
//         user: data.user,
//       },
//     }
//   }

export let supabase = null

export async function initSupabse() {
    if (!supabase) {
        supabase = await createClient();
    } 
    return supabase
}
await initSupabse()
// const supabase = createClient();

export async function call_eage_function(fun_name,body,headers,method="POST") {
    console.log("call_eage_function headers = ",headers)
    const { data, error } = await supabase.functions.invoke(fun_name, {
        method:method,
        body: body,
        headers:headers
    })
      
    if (error instanceof FunctionsHttpError) {
        const errorMessage = await error.context.json()
        console.log('Function returned an error', errorMessage)
    } else if (error instanceof FunctionsRelayError) {
        console.log('Relay error:', error.message)
    } else if (error instanceof FunctionsFetchError) {
        console.log('Fetch error:', error.message)
    }

    if (error) throw error

    return data
}

/**
 * 获取用户access_token。
 *
 * @returns {string} 返回值 为 当前登录用户的access_token。
 */
export async function access_token() {
	const { data:temp_user,error:user_error } = await supabase.auth.getUser()
	// if (user_error) {
	// 	throw user_error
	// }
	const { data, error } = await supabase.auth.getSession()
	if (error) {
	  throw error
	}
	// console.log("data.session = ",data.session)
	let access_token =  data && data.session && data.session.access_token
	if (!access_token) {
	  throw new Error('user is not login')
	}
	return access_token
}

/**
 * get_session
 *
 * @returns {string} 返回值 为 session
 */
export async function get_session() {
	const { data:temp_user,error:user_error } = await supabase.auth.getUser()
	// if (user_error) {
	// 	throw user_error
	// }
	const { data, error } = await supabase.auth.getSession()
	if (error) {
	  throw error
	}
	let session =  data && data.session
	if (!session) {
	  throw new Error('user is not login')
	}
	return session
}

/**
 * 用户是否登录。
 *
 * @returns {string} 返回值 为 当前登录用户的session。
 */ 
export async function islogin() {
	const { data:temp_user,error:user_error } = await supabase.auth.getUser()
	// if (user_error) {
	// 	throw user_error
	// }
	// console.log('islogin =',temp_user)
	const { data, error } = await supabase.auth.getSession()
	if (error) {
	  throw error
	}
	// console.log("data.session = ",data)
	let user = temp_user.user
	if (user) {
	  let { data } = await supabase.from("user").select("*").eq('id',user.id)
	  let profiles = data && data.length && data[0]
	  user.profiles = profiles
	//   localStorage.setItem('user_id',user.id)
	} else {
		// localStorage.removeItem('user_id')
	}

	return user
}

/**
 * 用户登录。
 *
 * @param {string} inviter - 邀请者id，可以为空。
 * @returns {string} 返回值 为 当前登录用户的session。
 */
export async function login(inviter) {
	const { data, error } = await supabase.auth.signInAnonymously({
	  data:{
		inviter:inviter
	  }
	})
	// console.log('login data =',data)
	if (error) {
	  throw error
	}
	if (!data.session) {
	  throw new Error('login error,no session found')
	}
	let user =  data && data.session && data.session.user
	if (user) {
		let { data } = await supabase.from("user").select("*").eq('id',user.id)
		let profiles = data && data.length && data[0]
		user.profiles = profiles
		// localStorage.setItem('user_id',user.id)
	}
	
	if (isTelegramMiniAPP()) {
		let linked = await islinkTelegram()
		if (!linked) {
			await linkTelegramMiniAPP()
		}
	}
	return user
}

function isTelegramMiniAPP() {
	if (typeof window !== "undefined" && window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) {
		return true
	}
	return false
}

/**
 * 绑定telegram 小程序。
 *
 * @returns {string} 返回值。
 */
async function linkTelegramMiniAPP() {
	try {
	  if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) {
		let temp = await call_eage_function('telegram_miniapp_provider',{
		  initData:window.Telegram.WebApp.initData
		})
		if (temp && temp.valid) {
		  return true
		}
		return false
	  }
	} catch (error) {
	  console.log("linkTelegramMiniAPP = ",error)
	  throw error
	}
}

/**
 * 是否绑定telegram。
 *
 * @returns {string} 返回值。
 */
export async function islinkTelegram() {
	const { data, error } = await supabase.functions.invoke('check_telegram_provider', {
		method:"GET"
	})
	console.log(`check_telegram_provider:`, data,error);
	if (error) throw error
	if (data && data.exist) {
	  return data
	}
	return null
}

/**
 * 绑定telegram。
 *
 * @returns {string} 返回值。
 */
export async function linkTelegram(redirectTo) {
	const { data, error } = await supabase.auth.getSession()
	if (error) {
	  throw error
	}
	if (!data.session) {
	  throw new Error('user is not login')
	}
	let session = data.session
	// console.log("data.session = ",data.session)
	let url = 'https://iaon.ai/telegram.html?data=' + session.access_token + '&redirectTo=' + redirectTo
	const encodedUrl = encodeURI(url);
	window.location.href = encodedUrl
}

 /**
 * 绑定twitter。
 *
 * @returns {string} 返回值。
 */
 export async function linkTwitter(redirectTo) {
	const { data, error } = await supabase.auth.linkIdentity({ 
	  provider: 'twitter',
	  options:{
		redirectTo:redirectTo
	  }
	})
	if (error) throw error
	return data
}

/**
 * 是否绑定twitter。
 *
 * @returns {string} 返回值。
 */
export async function islinkTwitter() {
	const { data, error } = await supabase.auth.getUser()
	if (error) throw error
	let user = data.user
	if (!user) {
		throw new Error('user is not exist')
	}
	let find = user.identities.find(e => e.provider == 'twitter')
	return find
}

/**
 * 当前登录用户的信息。
 *
 * @returns {string} 返回值 为 当前登录用户的信息。
 */
export async function userinfo() {
	const { data, error } = await supabase.auth.getUser()
	if (error) throw error
	let user = data.user
	if (user) {
		let { data } = await supabase.from("user").select("*").eq('id',user.id)
		let profiles = data && data.length && data[0]
		user.profiles = profiles
	}
	return user
}