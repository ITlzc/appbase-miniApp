const SUPABASE = require("@supabase/supabase-js");

const {supabaseUrl,supabaseKey} = require('../utils/supabase/config')
const {createClient} = require('../utils/supabase/static')
const functionsUrl = 'http://127.0.0.1:54321'; // 自定义边缘函数的域名

const supabase = SUPABASE.createClient(supabaseUrl, supabaseKey);
// supabase.functionsUrl = `${functionsUrl}/functions/v1`

import moment from 'moment';

import { parse } from 'uuid';

import CryptoJS from 'crypto-js';


// const server_supabase = 

const salt = 'c291cmNlPWF'

export async function generate_params(app) {
	let user = await islogin()
	let user_id = user && user.id
	user_id = user_id + salt
	user_id = CryptoJS.MD5(user_id).toString();

	let app_id = app && app.id
	app_id = app_id + salt
	app_id = CryptoJS.MD5(app_id).toString();
    let params = `source=appbase.online&source_uid=${user_id}&app_id=${app_id}`
    const encodedText = Buffer.from(params, 'utf-8').toString('base64');

	return { params, encodedText };
}


export async function call_eage_function(fun_name,body,headers) {
    console.log("call_eage_function headers = ",headers)
    const { data, error } = await supabase.functions.invoke(fun_name, {
        method:"POST",
        body: body,
        headers:headers
    })

	console.log('call_eage_function returned an error', error)
      
    // if (error instanceof FunctionsHttpError) {
    //     const errorMessage = await error.context.json()
    //     console.log('Function returned an error', errorMessage)
    // } else if (error instanceof FunctionsRelayError) {
    //     console.log('Relay error:', error.message)
    // } else if (error instanceof FunctionsFetchError) {
    //     console.log('Fetch error:', error.message)
    // }

    if (error) throw error

    return data
}

export async function logout() {
	const { error } = await supabase.auth.signOut()
	if (error) throw error
	return null
}

/**
 * 获取用户access_token。
 *
 * @returns {string} 返回值 为 当前登录用户的access_token。
 */
export async function get_access_token() {
	// const { data:temp_user,error:user_error } = await supabase.auth.getUser()
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
	// const { data:temp_user,error:user_error } = await supabase.auth.getUser()
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
 * set_session
 *
 * @returns {string} 返回值 为 session
 */
export async function set_session(session) {
	const { data, error } = await supabase.auth.setSession({
        access_token:session.access_token,
        refresh_token:session.refresh_token,
    })
	console.log("save_session sss = ",data,error)
    if (error) {
        throw error
    }
    return data && data.session
}

export async function bind_telegram() {
	// if (isTelegramMiniAPP()) {
	// 	let linked = await islinkTelegram()
	// 	if (!linked) {
	// 		linkTelegramMiniAPP()
	// 	}
	// }
}

export async function update_session() {
	const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
		console.log('会话事件:', event);
		console.log('当前会话:', session);
		// cloud_save_session(session)
		// if (session) {
		// 	bind_telegram()
		// }
	});
	console.log('update_session = ',subscription)

	return subscription
}


/**
 * 用户是否登录。
 *
 * @returns {string} 返回值 为 当前登录用户的session。
 */ 
export async function islogin() {
	// const { data:temp_user,error:user_error } = await supabase.auth.getUser()
	// if (user_error) {
	// 	throw user_error
	// }
	// console.log('islogin =',temp_user)
	const { data, error } = await supabase.auth.getSession()
	if (error) {
	  throw error
	}
	// console.log("data.session = ",data)
	let user = data && data.session && data.session.user
	// if (user) {
	//   let { data } = await supabase.from("user").select("*").eq('id',user.id)
	//   let profiles = data && data.length && data[0]
	//   user.profiles = profiles
	// //   localStorage.setItem('user_id',user.id)
	// } else {
	// 	// localStorage.removeItem('user_id')
	// }

	return user
}

/**
 * 用户登录。
 *
 * @param {string} inviter - 邀请者id，可以为空。
 * @returns {string} 返回值 为 当前登录用户的session。
 */
export async function login(inviter,tg_user_info) {
	const { data, error } = await supabase.auth.signInAnonymously({
		options:{
			data:{
				inviter_id:inviter,
				name: tg_user_info && (tg_user_info.username || ((tg_user_info.first_name || '') + (tg_user_info.last_name || ''))), 
				avatar:tg_user_info && tg_user_info.photo_url
			}
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
		cloud_save_session(data.session)
		let linked = await islinkTelegram()
		if (!linked) {
			await linkTelegramMiniAPP()
		}
	}
	return user
}

export function getSubstring(str) {
	if (!str) {
		return
	}
	console.log('getSubstring = ',str)
	if (str.length > 6) {
		return str.substring(0, 6);
	} else {
		return str;
	}
}

export function isTelegramMiniAPP() {
	return typeof window !== "undefined" && window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData ? window.Telegram.WebApp.initData : null
}

export function cloud_save_session(session) {
	console.log('cloud_save_session in = ',session)
	if (!isTelegramMiniAPP()) {
		return
	}
	console.log('cloud_save_session after in = ',session)
	if (!session) {
		return
	}
	let storage = window.Telegram.WebApp.CloudStorage
	session = JSON.stringify(session)
	return new Promise((resolve, reject) => {
		storage.setItem('sb-api-auth-token', session, (error) => {
			if (error) {
				reject(error)
			}
			resolve()
		})
	})
}

export function cloud_get_session() {
	if (!isTelegramMiniAPP()) {
		return
	}
	let storage = window.Telegram.WebApp.CloudStorage
	return new Promise((resolve, reject) => {
		storage.getItem('sb-api-auth-token', (error,value) => {
			console.log('cloud_get_session value = ',error,value)
			if (error) {
				reject(error)
			}
			if (value && typeof value == 'string' && value.length) {
				try {
					value = JSON.parse(value)
					resolve(value)
				} catch (error) {
					resolve(null)
				}
			} else{
				resolve(null)
			}
		})
	})
}

export function open_link(link) {
	console.log('open_link = ',link)
	if (!(link && link.length)) {
		return
	}
	const tg = window.Telegram && window.Telegram.WebApp;
	if (tg) {
		if (link.indexOf('t.me') > -1) {
			tg.openTelegramLink(link)
		} else {
			tg.openLink(link)
		}
	} else{
		window.open(link)
	}
}

export function cloud_remove_session() {
	if (!isTelegramMiniAPP()) {
		return
	}
	let storage = window.Telegram.WebApp.CloudStorage
	return new Promise((resolve, reject) => {
		storage.removeItem('sb-api-auth-token', (error) => {
			if (error) {
				reject(error)
			}
			resolve()
		})
	})
}

/**
 * 绑定telegram 小程序。
 *
 * @returns {string} 返回值。
 */
async function linkTelegramMiniAPP() {
	try {
	  if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) {
		console.log("linkTelegramMiniAPP in = ",window.Telegram.WebApp.initData)
		const { data, error } = await supabase.functions.invoke('telegram_miniapp_provider', {
			method:"POST",
			body: {
				initData:window.Telegram.WebApp.initData
			}
		})
		// let temp = await call_eage_function('telegram_miniapp_provider',{
		//   initData:window.Telegram.WebApp.initData
		// })
		console.log("linkTelegramMiniAPP error = ",data,error)
		if (data && data.valid) {
		  return true
		}
		return false
	  }
	} catch (error) {
	  console.log("linkTelegramMiniAPP = ",error)
	//   throw error
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
 * telegram token
 *
 * @returns {string} 返回值。
 */
export async function get_telegram_token() {
	try {
		if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) {
		  console.log("get_telegram_token in = ",window.Telegram.WebApp.initData)
		  const { data, error } = await supabase.functions.invoke('telegram_login_token', {
			  method:"POST",
			  body: {
				  initData:window.Telegram.WebApp.initData
			  }
		  })
		  // let temp = await call_eage_function('telegram_miniapp_provider',{
		  //   initData:window.Telegram.WebApp.initData
		  // })
		  if (error) {
			throw error
		  }
		  return data && data.token
		}
	} catch (error) {
		console.log("linkTelegramMiniAPP = ",error)
		throw error
	}
}

export async function email_login(email,password) {
	if (!(email && email.length)) {
	  throw new Error("email can not be null")
	}
	if (!(password && password.length)) {
	  throw new Error("password can not be null")
	}
	let { data, error } = await supabase.auth.signInWithPassword({
	  email: email,
	  password: password
	})
	if (error) throw error
	let user =  data && data.session && data.session.user

	if (user) {
	  let { data:profiles } = await supabase.from("profiles").select("*").eq('id',user.id)
	  profiles = profiles && profiles.length && profiles[0]
	  user.profiles = profiles
	}
	return user
  }

  /**
     * 邮箱注册。
     *
     * @param {string} email - 邮箱
     * @returns {string} 返回值。
     */
  export async function email_signUp(email,password) {
	console.log('email_signUp in = ',email,password)
	if (!(email && email.length)) {
	  throw new Error("email can not be null")
	}
	if (!(password && password.length)) {
	  throw new Error("password can not be null")
	}
	let { data, error } = await supabase.auth.signUp({
	  email: email,
	  password: password
	})
	console.log('email_signUp = ',data,error)
	if (error) throw error
	if (data && data.user && !(data.user.identities && data.user.identities.length) && (data.user.user_metadata && !data.user.user_metadata.email)) {
	  throw new Error('The email is already in use')
	}
	return data
  }

/**
 * telegram login。
 *
 * @returns {string} 返回值。
 */
export async function telegram_login_by_token(token) {
	const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'auth0', // 使用自定义提供者
        token,
    });

    if (error) {
        console.error('登录失败:', error);
        return null;
    }

    console.log('登录成功:', data);
	const user = await supabase.auth.getUser();
    return data;
}

export async function telegram_login(webAPP) {
	try {
		console.log("telegram_login in = ",window.Telegram.WebApp.initData)
		const { data, error } = await supabase.functions.invoke('telegram_login', {
			method:"POST",
			body: {
				initData:webAPP.initData,
				initDataUnsafe:webAPP.initDataUnsafe
			}
		})
		if (error) {
			throw error
		}
		if (data.code == 200 && data.data) {
			set_session(data.data)
		}
		return data
	} catch (error) {
		console.log("telegram_login = ",error)
		throw error
	}
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

export async function check_user_exist(user_id) {
	let { data,error} = await supabase.from("user").select("*").eq('id',user_id).single()
	console.log('check_user_exist = ',data,error)
	if (error) throw error
	if (data) {
		let { data:identity,error} = await supabase.from("identities").select("*").eq('user_id',user_id).eq('provider', 'telegram').limit(1)
		console.log('check_user_exist identity = ',identity,error)
		identity = identity && identity.length && identity[0]
		if (identity) {
			data.identity = identity
		}
	}
	return data
}


// Explore

// 获取公告
export async function getAnnouncement() {
	let { data: announcement, error: announcementError } = await supabase
		.from("announcement")
		.select("comment")
		.order("update_at", { ascending: false })
		.limit(0, 1);
	if (announcementError) {
		throw announcementError;
	}
	return announcement.length == 0 ? "" : announcement[0].comment;
}

// 获取轮播图
export async function getSlideshow() {
	let { data: slideshow, error: slideshowError } = await supabase
		.from("slideshow")
		.select("id,app_id,image_link")
		.order("update_at", { ascending: false });
		console.log('getSlideshow = ',slideshow,slideshowError)
	if (slideshowError) {
		return [];
	}
	return slideshow;
}

// 获取  奖励app数量 和 奖励task数量
export async function getRewardCount() {
	let res = {
	  rewardAppCount: 0,
	  rewardTaskCount: 0,
	};
	let {
	  data: appData,
	  error: appError,
	  count: appCount,
	} = await supabase
	  .from("app")
	  .select("id", { count: "exact", head: true })
	  .neq("points", 0);
	res.rewardAppCount = appCount;
	let {
	  data: taskData,
	  error: taskError,
	  count: taskCount,
	} = await supabase
	  .from("task")
	  .select("id", { count: "exact", head: true })
	  .neq("points", 0);
	res.rewardTaskCount = taskCount;
	return res;
  }

// 指定数量 最近更新的app
export async function recentUpdate(page,size,filter) {
	page = page ? page : 1
    size = size ? size : 6
    let offset = (page - 1) * size
    size = offset + size - 1

	let select = supabase
	.from("app")
	.select("id,name,icon,description,caption,is_forward")
	.is('deleted', false)
	if (filter && filter.category_id && filter.category_id.length) {
		select = select.eq('category_id', filter.category_id)
	}
	select = select.order("updated_at", { ascending: false })
	let { data, error } = await select.range(offset, size)

	if (error) {
		console.error("Error fetching data:", error);
		return;
	}
	return data;
}

// 指定数量 推荐APP的数据
export async function recommandData(page,size) {
	page = page ? page : 1
    size = size ? size : 3
    let offset = (page - 1) * size
    size = offset + size - 1
	
	let user = await islogin()
	console.log('recommandData = ',offset,size,user)
	let select = supabase
	.from("app")
	.select("id,name,icon,description,points,category_id,link,images,appPlatforms,caption,is_forward")
	.is('deleted', false)
	.eq('is_show',1)
	if (user) {
		select = supabase
		.from("app")
		.select("id,name,icon,description,points,category_id,link,images,appPlatforms,caption,is_forward,user_app(*)")
		.is('deleted', false)
		.eq('is_show',1)
		.eq('user_app.user_id',user.id)
	}
	let { data, error } = await select
	.order("recommend", { ascending: false })
	.order("id", { ascending: false })
	.range(offset, size)
	if (error) {
		console.error("Error fetching data:", error);
		return;
	}
	return data;
}

export async function recommandDataFromCache(page,filename) {
	console.log('recommandDataFromCache in = ',filename)
	let time = get3AMTimestamp()
	if (!(filename && filename.length)) {
		filename = 'app_recommend'
	}
	let path = `app-category/${time}/${filename}_${page}.json`
	console.log('recommandDataFromCache path = ',path)
	let apps = localStorage.getItem(path)
	if (apps && apps.length) {
		return JSON.parse(apps)
	}
	let expiresIn = 60
	// const { data:url, error:urlError } = await supabase.storage
	// .from("cache")
	// .createSignedUrl(path,expiresIn)
	const { data:url, error:urlError } = await supabase.storage.from('cache').getPublicUrl(path)
	console.log('recommandDataFromCache getPublicUrl = ',url,urlError)
	if (urlError) {
		throw urlError
	}

	try {
		let response = await fetch(url.publicUrl)
		console.log('recommandDataFromCache response = ',response)
		let data = await response.json()
		console.log('recommandDataFromCache download = ',data)
		// for (let i = 0; i < localStorage.length; i++) {
		// 	let key = localStorage.key(i)
		// 	console.log('app-category key = ',key)
		// 	if (key.indexOf("app-category") > -1) {
		// 		localStorage.removeItem(key)
		// 	}
		// }
		// localStorage.setItem(path,JSON.stringify(data))
		// let temp = `app-category/${getLast3AMTimestamp()}/${filename}.json`
		return data;
	} catch (error) {
		console.log('recommandDataFromCache error = ',error)
	}
	
	
	// const { data, error } = await supabase.storage.from('cache').download(url.signedUrl)
	// console.log('exploreAppDataFromCache download = ',data)
	// if (error) {
	// 	console.error("exploreAppDataFromCache Error fetching data:", error);
	// 	return;
	// }
	// return [];
}

// APP的分类
// export async function getCategorys() {
// 	let res = [];
// 	const { data: appTotal, count:appTotalCount, error: appError } = await supabase
// 		.from("app")
// 		.select("*", { count: "exact",head: true });
// 	if (appError) {
// 		console.error("查询错误:", appError);
// 	}
// 	res.push({ name: "All", category_id: "", count: appTotalCount });
// 	const { data: categoryData, error: categoryError } = await supabase
// 		.from("category")
// 		.select("id,title");
// 	if (categoryError) {
// 		console.error("查询错误:", categoryError);
// 	}
// 	let promise = []
// 	for (const category of categoryData) {
// 		let p = new Promise(async (resolve, reject) => {
// 			const { count: categoryCount, error } = await supabase
// 			.from("app")
// 			.select("*", { count: "exact" }) // 获取总数
// 			.eq("category_id", category.id);
// 			if (error) {
// 				resolve({
// 					category_id: category.id,
// 					name: category.title,
// 					count: 0
// 				})
// 				return
// 			}
// 			resolve({
// 				category_id: category.id,
// 				name: category.title,
// 				count: categoryCount
// 			})
// 		})
// 		promise.push(p)
// 	}
// 	let temp = await Promise.all(promise)
// 	res = res.concat(temp)
// 	return res
// }

export async function getCategorys() {
	let res = [];
	const { data: categoryData, error: categoryError } = await supabase
	  .from("category")
	  .select("id,title,countApps")
	  .is('is_show',true);
	if (categoryError) {
	  console.error("查询错误:", categoryError);
	}
	let appTotalCount = 0;
	for (const category of categoryData) {
	  appTotalCount += category.countApps;
	  res.push({
		name: category.title,
		category_id: category.id,
		count: category.countApps,
	  });
	}
	res.unshift({ name: "All", category_id: "app_all", count: appTotalCount });
	return res
  }

// 搜索数据
export async function searchData(name) {
	// console.log('searchData in =',name)
	const searchTerm = `${name}%`; // 匹配以 A 开头的 name
	const { data: searchData, error } = await supabase
		.from("app")
		.select("id, name, icon, description,link,images,appPlatforms,caption,points,is_forward")
		.like("name", searchTerm); // 使用 ilike 实现模糊查询
	// console.log('searchData searchData =',searchData,error)
	if (error) {
		console.error("Error fetching data:", error);
		return [];
	}
	return searchData;
}

export async function manageSearchData(name) {
	// console.log('searchData in =',name)
	const searchTerm = `${name}%`; // 匹配以 A 开头的 name
	const { data: searchData, error } = await supabase
		.from("app")
		.select("id, name, icon, description,link,images,appPlatforms,caption,points,is_forward")
		.eq('is_show',0)
		.like("name", searchTerm); // 使用 ilike 实现模糊查询
	// console.log('searchData searchData =',searchData,error)
	if (error) {
		console.error("Error fetching data:", error);
		return [];
	}
	return searchData;
}

// 每个类别的数据
export async function exploreAppData(page,size,filter) {
	page = page ? page : 1
    size = size ? size : 6
    let offset = (page - 1) * size
    size = offset + size - 1
	let select = supabase
	.from("app")
	.select("id,name,icon,description,points,link,images,appPlatforms,caption,is_forward")
	.is('deleted', false)
	
	let user = await islogin()
	if (user) {
		select = supabase
		.from("app")
		.select("id,name,icon,description,points,link,images,appPlatforms,caption,is_forward,user_app(*)")
		.is('deleted', false)
		.eq('user_app.user_id',user.id)
	}
	if (filter && filter.category_id && filter.category_id.length) {
		select = select.eq('category_id', filter.category_id)
	}
	select = select.order("updated_at", { ascending: false })
	let { data, error } = await select.range(offset, size)
	if (error) {
		console.error("Error fetching data:", error);
		return;
	}
	return data;
}

export async function set_show(app,flag) {
	let {data,error} = await supabase
	.from('app')
	.update({'is_show':flag})
	.eq('id',app.id)
	.select()

	console.log('set_show = ',data,error)

	if (error) {
		console.error("Error set_show:", error);
		return;
	}
	return data
}

export async function allApps(page,size) {
	page = page ? page : 1
    size = size ? size : 10
    let offset = (page - 1) * size
    size = offset + size - 1
	let { data, count,error } = await supabase
	.from("app")
	.select("id,name,is_show,icon,description,points,link,images,appPlatforms,caption,is_forward",{ count: "exact" })
	.is('deleted', false)
	.eq('is_show',0)
	.order("created_at", { ascending: false })
	.range(offset, size)
	console.log('allApps = ',count,error,data)
	
	if (error) {
		console.error("Error fetching data:", error);
		return;
	}
	return {count,data};
}

function getLastHourTimestamp() {
    const now = new Date(); // 当前时间
    const currentMinutes = now.getMinutes(); // 当前分钟

    // 如果当前时间的分钟部分不是 0，则返回当前整点时间
    if (currentMinutes > 0) {
        now.setMinutes(0, 0, 0); // 设置为当前小时的整点时间
    } else {
        // 如果分钟部分是 0，则返回前一个小时的时间戳
        now.setHours(now.getHours() - 1, 0, 0, 0);
    }

    return Math.floor(now.getTime() / 1000); // 返回秒级时间戳
}

export async function get_top_100_new() {
	console.log('get_top_100_new in = ')
	let time = getLastHourTimestamp()
	let path = `user-rank/${time}/user_top_100.json`
	console.log('get_top_100_new path = ',path)
	let tops = localStorage.getItem(path)
	if (tops && tops.length) {
		return JSON.parse(tops)
	}
	let expiresIn = 60
	const { data:url, error:urlError } = await supabase.storage
	.from("cache")
	.createSignedUrl(path,expiresIn)
	console.log('get_top_100_new getPublicUrl = ',url.signedUrl,urlError)
	if (urlError) {
		throw urlError
	}

	try {
		let response = await fetch(url.signedUrl)
		console.log('get_top_100_new response = ',response)
		let data = await response.json()
		console.log('get_top_100_new download = ',data)
		for (let i = 0; i < localStorage.length; i++) {
			let key = localStorage.key(i)
			console.log('get_top_100_new key = ',key)
			if (key.indexOf("user_top_100") > -1) {
				localStorage.removeItem(key)
			}
		}
		localStorage.setItem(path,JSON.stringify(data))
		return data;
	} catch (error) {
		console.log('get_top_100_new error = ',error)
	}
}

export async function get_user_apps(app_ids) {
	let user = await islogin()
	const { data, error } = await supabase
    .from("user_app")
    .select("*") // 获取总数
    .in("app_id", app_ids)
    .eq('user_id',user.id)
	if (error) throw error
	return data
}

function getTimezoneOffsetFromBeijing() {
    const currentDate = new Date();
    const currentOffset = currentDate.getTimezoneOffset(); // 当前时区与 UTC 的偏移（分钟）
	
    const beijingOffset = 8 * 60; // 东八区的偏移（分钟）
    
    let offsetFromBeijing = currentOffset - beijingOffset;
	if (beijingOffset > currentOffset) {
		offsetFromBeijing = beijingOffset + currentOffset
	}
	console.log('getTimezoneOffsetFromBeijing = ',currentOffset,beijingOffset,offsetFromBeijing)
    
    // 返回当前时区与东八区的偏移
    return offsetFromBeijing * 60;
}

function get3AMTimestamp() {
    const now = new Date(); // 当前时间
    const currentHour = now.getHours(); // 当前小时
    const currentMinute = now.getMinutes(); // 当前分钟

    // 创建当天凌晨 3 点的时间
    const today3AM = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 3, 0, 0, 0);

    // 如果当前时间早于凌晨 3:01，取前一天凌晨 3 点
    if (currentHour < 3 || (currentHour === 3 && currentMinute < 1)) {
        today3AM.setDate(today3AM.getDate() - 1); // 前一天
    }

	let timestamp = Math.floor(today3AM.getTime() / 1000);
	timestamp = timestamp - getTimezoneOffsetFromBeijing()
	console.log('get3AMTimestamp = ',now,today3AM,timestamp,getTimezoneOffsetFromBeijing())

    return timestamp
}

// function get3AMTimestamp() {
// 	const currentTime = new Date();
// 	const indiaOffset = 5.5 * 60; // 印度标准时间 (IST) 与 UTC 的偏移，单位为分钟
// 	const indiaTime = new Date(currentTime.getTime() + currentTime.getTimezoneOffset() * 60000 + indiaOffset * 60000);

// // 目标时间为东八区凌晨3点
// 	const targetOffset = 8 * 60; // 东八区 (CST) 与 UTC 的偏移，单位为分钟
// 	const targetDate = new Date(
// 		indiaTime.getUTCFullYear(),
// 		indiaTime.getUTCMonth(),
// 		indiaTime.getUTCDate(),
// 		3 - (targetOffset / 60), // 将小时调整为 UTC 时间
// 		0, 0, 0
// 	);

// 	// 计算目标时间的时间戳
// 	const timestampTarget = Math.floor(targetDate.getTime() / 1000);
// 	console.log('get3AMTimestamp = ',currentTime,indiaOffset,indiaTime,targetOffset,targetDate,timestampTarget)
	// return getBeijing3AMTimestamp()
// }

function getCurrentBeijingTime() {
    const beijingOffset = 8 * 60; // 东八区时区偏移，单位：分钟
    const currentDate = new Date();
    const utc = currentDate.getTime() + currentDate.getTimezoneOffset() * 60000; // 获取 UTC 时间戳
    const beijingTime = new Date(utc + beijingOffset * 60000); // 转换为东八区时间
	console.log('getCurrentBeijingTime = ',currentDate,utc,beijingTime)
    return beijingTime;
}

function getBeijing3AM() {
    const currentBeijingTime = getCurrentBeijingTime();
    currentBeijingTime.setHours(3, 0, 0, 0); // 设置时间为东八区的凌晨 3 点
    return currentBeijingTime;
}

function getBeijing3AMTimestamp() {
    const beijing3AM = getBeijing3AM();
    return Math.floor(beijing3AM.getTime() / 1000);
}
  


function getLast3AMTimestamp() {
    const now = new Date(); // 当前时间
    const currentHour = now.getHours(); // 当前小时
    const currentMinute = now.getMinutes(); // 当前分钟

    // 创建当天凌晨 3 点的时间
    const today3AM = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 3, 0, 0, 0);
	today3AM.setDate(today3AM.getDate() - 1); // 前一天

    return Math.floor(today3AM.getTime() / 1000);
}

export async function exploreAppDataFromCache(filename,page) {
	console.log('exploreAppDataFromCache in = ',filename)
	let time = get3AMTimestamp()
	if (!(filename && filename.length)) {
		filename = 'app_all'
	}
	let path = `app-category/${time}/${filename}_${page}.json`
	console.log('exploreAppDataFromCache path = ',path)
	let apps = localStorage.getItem(path)
	if (apps && apps.length) {
		return JSON.parse(apps)
	}
	let expiresIn = 60
	// const { data:url, error:urlError } = await supabase.storage
	// .from("cache")
	// .createSignedUrl(path,expiresIn)
	const { data:url, error:urlError } = await supabase.storage.from('cache').getPublicUrl(path)
	console.log('exploreAppDataFromCache getPublicUrl = ',url,urlError)
	if (urlError) {
		throw urlError
	}

	try {
		let response = await fetch(url.publicUrl)
		console.log('exploreAppDataFromCache response = ',response)
		let data = await response.json()
		console.log('exploreAppDataFromCache download = ',data)
		// for (let i = 0; i < localStorage.length; i++) {
		// 	let key = localStorage.key(i)
		// 	console.log('app-category key = ',key)
		// 	if (key.indexOf("app-category") > -1) {
		// 		localStorage.removeItem(key)
		// 	}
		// }
		// localStorage.setItem(path,JSON.stringify(data))
		// let temp = `app-category/${getLast3AMTimestamp()}/${filename}.json`
		return data;
	} catch (error) {
		console.log('exploreAppDataFromCache error = ',error)
	}
	
	
	// const { data, error } = await supabase.storage.from('cache').download(url.signedUrl)
	// console.log('exploreAppDataFromCache download = ',data)
	// if (error) {
	// 	console.error("exploreAppDataFromCache Error fetching data:", error);
	// 	return;
	// }
	// return [];
}

export const trial_app_next_time = 1000 * 60 * 60 *24

export async function trailApp(app) {
	let user = await islogin()
	if (!user) {
		return false
	}
	let need_insert = false
	if (app.user_app && app.user_app.length) {
		const sortedData = app.user_app.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
		let user_app = sortedData[0]
		let status = user_app.status
		let flag = false
		let now = new Date().getTime()
		let update_time = moment(user_app.updated_at)
		// console.log('update_time =',update_time,typeof update_time)
		update_time = update_time.valueOf();
		if (status == 0) {
			status = 1
			flag = true
		}
		if (status == 1) {
			if (now - update_time >= 1000 * 60) {
				status = 2
				flag = true
			}
		}
		if (status == 2) {
			if (now - update_time >= trial_app_next_time) {
				need_insert = true
			}
		}
		// console.log('need_insert qqq = ',need_insert)
		if (!need_insert) {
			// console.log('gfgfgfgf')
			if (flag) {
				const { data, error } = await supabase
				.from('user_app')
				.update({ status: status,updated_at:new Date() })
				.eq('id', user_app.id)
				.select()
			}
			return status
		}
	} else {
		need_insert = true
	}
	// console.log('need_insert = ',need_insert)
	if (need_insert) {
		// console.log('asdsdsads')
		const { data, error } = await supabase
		.from('user_app')
		.insert([
			{status:1, user_id:user.id, app_id:app.id},
		])
		.select()
		return 1
	}
}

// app的信息数据
export async function getApp(app_id) {
	console.log('getApp in = ',app_id)
	let user = await islogin()
	let select = supabase
	.from("app")
	.select(
		"id,name,is_forward,icon,description,points,category_id,link,images,appPlatforms,caption,ranking_in_category,rating,category(title)"
	)
	.eq("id", app_id)
	if (user) {
		select = supabase
		.from("app")
		.select(
			"id,name,is_forward,icon,description,points,category_id,link,images,appPlatforms,caption,ranking_in_category,rating,category(title),user_app(*)"
		)
		.eq("id", app_id)
		.eq('user_app.user_id',user.id)
	}
	let { data: appInfo, error } = await select
		.order("recommend", { ascending: false })
		.single();
	if (error) {
		console.error("Error fetching data:", error);
		return;
	}
	console.log('getApp appInfo = ',appInfo)
	// appInfo.grade = 0;
	appInfo.reviews = 0;
	// // 查询app_id在category_id分类下的排名
	// const { data: appRankData, error: appRankError } = await supabase
	// 	.from("app")
	// 	.select("id, rating")
	// 	.eq("category_id", appInfo.category_id) // 按 category_id 过滤
	// 	.order("rating", { ascending: false }) // 按 rank 降序排列
	// 	.order('updated_at',{ ascending: false })

	// if (appRankError) {
	// 	console.error("查询错误:", appRankError);
	// 	return;
	// }
	// // 找到 app_id 的排名
	// const rankPosition = appRankData.findIndex((app) => app.id === app_id) + 1; // 数组下标 + 1 为排名
	// console.log(
	// 	`app_id 为 ${app_id} 在 category_id 为 ${appInfo.category_id} 下的排名为: 第 ${rankPosition} 名`
	// );
	// appInfo.rank = rankPosition;

	const {count,error: reviewsError } = await supabase
		.from("user_reviews")
		.select("score", { count: "exact" ,head:true}) // 使用 count 选项获取总条数
		.eq("app_id", app_id);
	if (reviewsError) {
		console.error("查询错误:", error);
	}
	appInfo.reviews_count = count
	// else {
	// 	const totalReviews = reviews.length;
	// 	const avgScore =
	// 		reviews.reduce((sum, review) => sum + review.score, 0) / totalReviews;
	// 	console.log(`总评论数: ${totalReviews}`);
	// 	console.log(`平均评分: ${avgScore.toFixed(2)}`);
	// 	appInfo.grade = totalReviews;
	// 	appInfo.reviews = avgScore.toFixed(2);
	// }
	return appInfo;
}

export async function get_task_group() {
	let { data, error } = await supabase
	.from('task')
	.select('*')
	console.log('get_task_group = ',data,error)
	if (error) {
		return []
	}
	return data
}

// MiniAPP

export async function get_share_link() {
	let { data, error } = await supabase
		.from("app_base_config")
		.select("*")
		.single();
	if (error) {
		throw error;
	}
	return data && data.mini_app_share_link;
}

const calculateSumDynamic = async (tableName, fieldName, conditions = []) => {
    const { data, error } = await supabase
        .rpc('dynamic_sum', {
            table_name: tableName,
            field_name: fieldName,
            conditions: conditions
        })

    if (error) {
        console.error('Error calculating sum:', error)
        return
    }

    console.log(`Sum of ${fieldName} in ${tableName} with conditions ${JSON.stringify(conditions)}:`, data)
    return data
}

export const get_reward_points = async (user_id) => {
	let conditions = []
    if (user_id) {
        conditions.push({ field: 'user_id', value: user_id })
		conditions.push({ field: 'points_type', value: 3 })
    }
    // 根据 user_id 查app表里的visit_count 的和
    let data = await calculateSumDynamic('user_point_record', 'points', conditions)
    return data
}

export async function get_user_info(user_id) {
	let { data, error } = await supabase
		.from("user")
		.select("*")
		.eq('id',user_id)
		.single();
	if (error) {
		throw error;
	}
	return data;
}

export async function get_user_ferinds(user_id,page,size) {
	page = page ? page : 1
    size = size ? size : 5
    let offset = (page - 1) * size
    size = offset + size - 1
	let { data, error } = await supabase
		.from("user")
		.select("*")
		.eq('inviter_id',user_id)
		.order("updated_at", { ascending: false })
		.range(offset, size);
	if (error) {
		throw error;
	}
	let source_ids = []
	data.map(item => {
		source_ids.push(item.id)
	})
	if (source_ids && source_ids.length) {
		let { data:recrod, error: recrod_error} = await supabase
		.from("user_point_record")
		.select("*")
		.in('source_id',source_ids)
		.order("updated_at", { ascending: false })

		data.map(item => {
			recrod.map(record => {
				if (item.id == record.source_id) {
					item.points = record.points
				}
			})
		})
	}
	return data;
}

export async function get_top_100(page,size) {
	console.log('get_top_100 in = ',page,size)
	page = page ? page : 1
    size = size ? size : 5
    let offset = (page - 1) * size
    size = offset + size - 1
	console.log('get_top_100 offset = ',offset,size)
	let { data, error } = await supabase
		.from("user")
		.select("*")
		.neq('rank',0)
		.order("rank", { ascending: true })
		.order("created_at", { ascending: false })
		.range(offset, size);
	if (error) {
		throw error;
	}
	return data
}

export async function count_holders() {
	let { data, count, error } = await supabase
    .from("user")
    .select("*", { count: "exact" })
    .or('invite_points.gt.0,earn_points.gt.0,task_points.gt.0');
	if (error) {
		throw error;
	}
	return count
}

export async function countholdersFromCache() {
	console.log('countholdersFromCache in = ')
	let time = getLastHourTimestamp()
	let path = `user-rank/${time}/user_holders.json`
	console.log('countholdersFromCache path = ',path)
	// let apps = localStorage.getItem(path)
	// if (apps && apps.length) {
	// 	return JSON.parse(apps)
	// }
	let expiresIn = 60
	// const { data:url, error:urlError } = await supabase.storage
	// .from("cache")
	// .createSignedUrl(path,expiresIn)
	const { data:url, error:urlError } = await supabase.storage.from('cache').getPublicUrl(path)
	console.log('countholdersFromCache getPublicUrl = ',url,urlError)
	if (urlError) {
		throw urlError
	}

	try {
		let response = await fetch(url.publicUrl)
		console.log('countholdersFromCache response = ',response)
		let data = await response.json()
		console.log('countholdersFromCache download = ',data)
		// for (let i = 0; i < localStorage.length; i++) {
		// 	let key = localStorage.key(i)
		// 	console.log('app-category key = ',key)
		// 	if (key.indexOf("app-category") > -1) {
		// 		localStorage.removeItem(key)
		// 	}
		// }
		// localStorage.setItem(path,JSON.stringify(data))
		// let temp = `app-category/${getLast3AMTimestamp()}/${filename}.json`
		return data;
	} catch (error) {
		console.log('countholdersFromCache error = ',error)
	}
	
	
	// const { data, error } = await supabase.storage.from('cache').download(url.signedUrl)
	// console.log('exploreAppDataFromCache download = ',data)
	// if (error) {
	// 	console.error("exploreAppDataFromCache Error fetching data:", error);
	// 	return;
	// }
	// return [];
}

export async function get_points_record(user_id,page,size) {
	page = page ? page : 1
    size = size ? size : 5
    let offset = (page - 1) * size
    size = offset + size - 1
	let { data,error} = await supabase
	.from('user_point_record')
	.select('*')
	.eq('user_id',user_id)
	.order('created_at',{ascending:false})
	.range(offset, size);
	if (error) {
		throw error;
	}
	return data
}


// 获取公告
async function appGetAnnouncement() {
	let { data: announcement, error: announcementError } = await supabase
		.from("announcement")
		.select("comment")
		.order("updated_at", { ascending: false })
		.range(0, 1);
	if (announcementError) {
		throw announcementError;
	}
	return announcement.length == 0 ? "" : announcement[0].comment;
}

// 获取轮播图
async function appGetSlideshow() {
	let { data: slideshow, error: slideshowError } = await supabase
		.from("slideshow")
		.select("app_id,image_link")
		.order("updated_at", { ascending: false });
	if (slideshowError) {
		throw slideshowError;
	}
	return slideshow;
}

// points_type : 1-app   2-task   3-invite
const AppPointsEnum = {
	app: 1,
	task: 2,
	invite: 3,
};

const UserAppStatusEnum = {
	open: 1,
	verify: 2,
};

async function appRecommandData(recommendAppCount) {
	let res = [];
	let { data: recommandData, error } = await supabase
		.from("app")
		.select("id,name,icon,description,points")
		.order("recommend", { ascending: false })
		.range(0, recommendAppCount);
	if (error) {
		console.error("Error fetching data:", error);
		return;
	}
	console.log("Fetched data:", data);
	for (const app of recommandData) {
		let earnRewardTime,
			status = await checkIsEarnAppReward(app.id, AppPointsEnum["app"]);
		let resp = {
			name: app.name,
			icon: app.icon,
			description: app.description,
			points: app.points,
			earnRewardTime: earnRewardTime,
			status: status,
		};
		res.push(resp);
	}
	return res;
}

// 搜索数据
// async function searchData(name) {
// 	const searchTerm = `${name}%`; // 匹配以 A 开头的 name
// 	const { data: searchData, error } = await supabase
// 		.from("app")
// 		.select("id, name, icon, description,link,images,appPlatforms")
// 		.like("name", searchTerm); // 使用 ilike 实现模糊查询
// 	if (error) {
// 		console.error("Error fetching data:", error);
// 		return;
// 	}
// 	return searchData;
// }

async function appGetCategorys() {
	let res = [];
	const { data: appTotalCount, error: appError } = await supabase
		.from("app")
		.select("*", { count: "exact" });
	if (appError) {
		console.error("查询错误:", appError);
	}
	res.push({ name: "All", category_id: "", count: appTotalCount });
	const { data: categoryData, error: categoryError } = await supabase
		.from("category")
		.select("id,title");
	if (categoryError) {
		console.error("查询错误:", categoryError);
	}
	for (const category of categoryData) {
		const { count: categoryCount, error } = await supabase
			.from("app")
			.select("*", { count: "exact" }) // 获取总数
			.eq("category_id", category.id);
		res.push({
			name: category.title,
			category_id: category.id,
			count: categoryCount,
		});
	}
}

async function appExploreAppData(category_id, limitCount) {
	let res = [];
	let recommandDataArr = [];
	if (category_id == "") {
		let { data: recommandData, error } = await supabase
			.from("app")
			.select("id,name,icon,description,points")
			.order("updated_at", { ascending: false })
			.range(0, limitCount);
		if (error) {
			console.error("Error fetching data:", error);
			return;
		}
		recommandDataArr = recommandData;
	} else {
		let { data: recommandData, error } = await supabase
			.from("app")
			.select("id,name,icon,description,points")
			.order("updated_at", { ascending: false })
			.eq("category_id", category_id)
			.range(0, limitCount);
		if (error) {
			console.error("Error fetching data:", error);
			return;
		}
		recommandDataArr = recommandData;
	}
	// 示例：将数据渲染到页面上
	for (const app of recommandDataArr) {
		let earnRewardTime,
			status = await checkIsEarnAppReward(app.id, AppPointsEnum["app"]);
		let resp = {
			name: app.name,
			icon: app.icon,
			description: app.description,
			points: app.points,
			earnRewardTime: earnRewardTime,
			status: status,
		};
		res.push(resp);
	}
	return res;
}

async function appGetAppInfo(app_id, user_id) {
	let { data: appInfo, error } = await supabase
		.from("app")
		.select(
			"id,name,icon,description,points,category_id,link,images,appPlatforms"
		)
		.order("recommend", { ascending: false })
		.eq("id", app_id)
		.single();
	if (error) {
		console.error("Error fetching data:", error);
		return;
	}
	appInfo.grade = 0;
	appInfo.reviews = 0;
	// 查询app_id在category_id分类下的排名
	const { data: appRankData, error: appRankError } = await supabase
		.from("app")
		.select("id, rank")
		.eq("category_id", category_id) // 按 category_id 过滤
		.order("rank", { ascending: false }); // 按 rank 降序排列

	if (appRankError) {
		console.error("查询错误:", error);
		return;
	}
	// 找到 app_id 的排名
	const rankPosition = appRankData.findIndex((app) => app.id === app_id) + 1; // 数组下标 + 1 为排名
	console.log(
		`app_id 为 ${app_id} 在 category_id 为 ${category_id} 下的排名为: 第 ${rankPosition} 名`
	);
	appInfo.rank = rankPosition;

	const { data: reviews, error: reviewsError } = await supabase
		.from("user_reviews")
		.select("score", { count: "exact" }) // 使用 count 选项获取总条数
		.eq("app_id", app_id);
	if (reviewsError) {
		console.error("查询错误:", error);
	} else if (reviews.length === 0) {
		console.log("not found reviews");
	} else {
		const totalReviews = reviews.length;
		const avgScore =
			reviews.reduce((sum, review) => sum + review.score, 0) / totalReviews;
		console.log(`总评论数: ${totalReviews}`);
		console.log(`平均评分: ${avgScore.toFixed(2)}`);
		appInfo.grade = totalReviews;
		appInfo.reviews = avgScore.toFixed(2);
	}
	let earnTime,
		status = await checkIsEarnAppReward(app_id, AppPointsEnum["app"], user_id);
	return appInfo;
}

async function appGetTask(user_id) {
	let { data: taskInfo, error } = await supabase
		.from("task")
		.select("id,name,icon,points")
		.order("updated_at", { ascending: false });
	for (const task of taskInfo) {
		let taskStatus = await supabase
			.from("task")
			.select("status")
			.eq("user_id", user_id)
			.eq("task_id", task.id)
			.single();
		taskInfo.status = taskStatus.status;
	}
	return taskInfo;
}

async function appGetUserInviteData(user_id) {
	let { data: userData, error: userError } = await supabase
		.from("user")
		.select("id,verify_passed_count,invite_user_count")
		.eq("id", user_id)
		.single();
	if (userError) {
		throw userError;
	}
	return userData;
}

async function appGetInviteFriend(inviter_id) {
	let { data: inviterData, error: userError } = await supabase
		.from("user")
		.select("id,name,avatar,invite_points,earn_points,task_points")
		.eq("inviter_id", inviter_id);
	if (userError) {
		throw userError;
	}
	return inviterData;
}

async function appGetLeaderBoard() {
	const { data: userData, error } = await supabase.rpc("custom_query", {
		query: `
			SELECT id,name,avatar, (invite_points + task_points + earn_points) AS total_points 
			FROM user
			ORDER BY total_points DESC;
		`,
	});
	if (error) {
		throw error;
	}
	return userData;
}

async function appGetUserInfo(user_id) {
	let { data: userData, error: userError } = await supabase
		.from("user")
		.select("id,name,avatar,invite_points,earn_points,task_points");
}

// points_type : 1-app   2-task   3-invite
async function checkIsEarnAppReward(appId, points_type, userId) {
	let { data: recordData, error } = await supabase
		.from("user_point_record")
		.select("")
		.eq("source_id", appId)
		.eq("points_type", points_type)
		.order("created_at", { ascending: false });
	if (error) {
		console.log("Get app earn reward record data error:", error);
		throw error;
	}
	if (recordData && recordData.length == 0) {
		return 0;
	}
	let plus24HourTimestamp = convertTimestamptzToUnixPlus24Hours(
		recordData[0].created_at
	);
	let currentTimestamp = Date.now();
	let earnTime =
		plus24HourTimestamp > currentTimestamp ? plus24HourTimestamp : 0;
	let { data: userAppData, error: userAppError } = await supabase
		.from("user_app")
		.select("status")
		.eq("user_id", userId)
		.eq("app_id", appId)
		.order("updated_at", { ascending: false });
	let status = UserAppStatusEnum["open"];
	if (
		userAppData.length > 0 &&
		userAppData[0].status == UserAppStatusEnum["verify"]
	) {
		status = UserAppStatusEnum["verify"];
	}
	return earnTime, status;
}

function convertTimestamptzToUnixPlus24Hours(timestamptz) {
	// 将 ISO 字符串转换为 JavaScript Date 对象
	const date = new Date(timestamptz);

	// 获取当前的 Unix 时间戳（秒）
	let unixTimestamp = Math.floor(date.getTime() / 1000);

	// 推迟 24 小时（24 * 60 * 60 秒）
	const SECONDS_IN_A_DAY = 24 * 60 * 60;
	unixTimestamp += SECONDS_IN_A_DAY;

	return unixTimestamp;
}