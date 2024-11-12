import { createBrowserClient } from '@supabase/ssr'

import {supabaseUrl,supabaseKey} from './config'


export function createClient() {
  const supabase = createBrowserClient(
    supabaseUrl,
    supabaseKey
  )

  return supabase
}

// const supabase = createClient();

// /**
//  * 获取用户access_token。
//  *
//  * @returns {string} 返回值 为 当前登录用户的access_token。
//  */
// export async function access_token() {
// 	const { data, error } = await supabase.auth.getSession()
// 	if (error) {
// 	  throw error
// 	}
// 	// console.log("data.session = ",data.session)
// 	let access_token =  data && data.session && data.session.access_token
// 	if (!access_token) {
// 	  throw new Error('user is not login')
// 	}
// 	return access_token
// }

// /**
//  * 用户是否登录。
//  *
//  * @returns {string} 返回值 为 当前登录用户的session。
//  */ 
// export async function islogin() {
// 	const { data, error } = await supabase.auth.getSession()
// 	if (error) {
// 	  throw error
// 	}
// 	console.log("data.session = ",data.session)
// 	let user =  data && data.session && data.session.user
// 	if (user) {
// 	  let { data } = await supabase.from("user").select("*").eq('id',user.id)
// 	  let profiles = data && data.length && data[0]
// 	  user.profiles = profiles
// 	}
// 	return user
// }

// /**
//  * 用户登录。
//  *
//  * @param {string} inviter - 邀请者id，可以为空。
//  * @returns {string} 返回值 为 当前登录用户的session。
//  */
// export async function login(inviter) {
// 	const { data, error } = await supabase.auth.signInAnonymously({
// 	  data:{
// 		inviter:inviter
// 	  }
// 	})
// 	if (error) {
// 	  throw error
// 	}
// 	if (!data.session) {
// 	  throw new Error('login error,no session found')
// 	}
// 	let user =  data && data.session && data.session.user
// 	if (user) {
// 		let { data } = await supabase.from("user").select("*").eq('id',user.id)
// 		let profiles = data && data.length && data[0]
// 		user.profiles = profiles
// 	}
// 	// let linked = await islinkTelegram()
// 	// if (isTelegramMiniAPP() && !linked) {
// 	//   await linkTelegramMiniAPP()
// 	// }
// 	return user
// }

// function isTelegramMiniAPP() {
// 	if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) {
// 		return true
// 	}
// 	return false
// }

// /**
//  * 绑定telegram 小程序。
//  *
//  * @returns {string} 返回值。
//  */
// async function linkTelegramMiniAPP() {
// 	try {
// 	  if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) {
// 		let temp = await call_eage_function('telegram_miniapp_provider',{
// 		  initData:window.Telegram.WebApp.initData
// 		})
// 		if (temp && temp.valid) {
// 		  return true
// 		}
// 		return false
// 	  }
// 	} catch (error) {
// 	  console.log("linkTelegramMiniAPP = ",error)
// 	  throw error
// 	}
// }

// /**
//  * 是否绑定telegram。
//  *
//  * @returns {string} 返回值。
//  */
// export async function islinkTelegram() {
// 	const { data, error } = await supabase.functions.invoke('check_telegram_provider', {
// 		method:"GET"
// 	})
// 	console.log(`check_telegram_provider:`, data,error);
// 	if (error) throw error
// 	if (data && data.exist) {
// 	  return data
// 	}
// 	return null
// }

// /**
//  * 绑定telegram。
//  *
//  * @returns {string} 返回值。
//  */
// export async function linkTelegram(redirectTo) {
// 	const { data, error } = await supabase.auth.getSession()
// 	if (error) {
// 	  throw error
// 	}
// 	if (!data.session) {
// 	  throw new Error('user is not login')
// 	}
// 	let session = data.session
// 	// console.log("data.session = ",data.session)
// 	let url = 'https://iaon.ai/telegram.html?data=' + session.access_token + '&redirectTo=' + redirectTo
// 	const encodedUrl = encodeURI(url);
// 	window.location.href = encodedUrl
// }

//  /**
//  * 绑定twitter。
//  *
//  * @returns {string} 返回值。
//  */
//  export async function linkTwitter(redirectTo) {
// 	const { data, error } = await supabase.auth.linkIdentity({ 
// 	  provider: 'twitter',
// 	  options:{
// 		redirectTo:redirectTo
// 	  }
// 	})
// 	if (error) throw error
// 	return data
// }

// /**
//  * 是否绑定twitter。
//  *
//  * @returns {string} 返回值。
//  */
// export async function islinkTwitter() {
// 	const { data, error } = await supabase.auth.getUser()
// 	if (error) throw error
// 	let user = data.user
// 	if (!user) {
// 		throw new Error('user is not exist')
// 	}
// 	let find = user.identities.find(e => e.provider == 'twitter')
// 	return find
// }

// /**
//  * 当前登录用户的信息。
//  *
//  * @returns {string} 返回值 为 当前登录用户的信息。
//  */
// export async function userinfo() {
// 	const { data, error } = await supabase.auth.getUser()
// 	if (error) throw error
// 	let user = data.user
// 	if (user) {
// 		let { data } = await supabase.from("user").select("*").eq('id',user.id)
// 		let profiles = data && data.length && data[0]
// 		user.profiles = profiles
// 	}
// 	return user
// }