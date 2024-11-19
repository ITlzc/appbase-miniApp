const SUPABASE = require("@supabase/supabase-js");

const {supabaseUrl,supabaseKey} = require('../utils/supabase/config')
const {createClient} = require('../utils/supabase/static')
const functionsUrl = 'http://127.0.0.1:54321'; // 自定义边缘函数的域名

const supabase = SUPABASE.createClient(supabaseUrl, supabaseKey);
// supabase.functionsUrl = `${functionsUrl}/functions/v1`

import moment from 'moment';

import { parse } from 'uuid';

// const server_supabase = 


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
		let linked = await islinkTelegram()
		if (!linked) {
			await linkTelegramMiniAPP()
		}
	}
	return user
}

export function isTelegramMiniAPP() {
	return typeof window !== "undefined" && window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData ? window.Telegram.WebApp.initData : null
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

/**
 * telegram login。
 *
 * @returns {string} 返回值。
 */
export async function telegram_login(token) {
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
	.select("id,name,icon,description,points,category_id,link,images,appPlatforms,caption,is_forward,user_app(*)")
	.is('deleted', false)
	.order("recommend", { ascending: false })
	.order("id", { ascending: false })
	.range(offset, size)
	if (user) {
		select = select.eq('user_app.user_id',user.id)
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
	  .select("id,title,countApps");
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
	res.unshift({ name: "All", category_id: "", count: appTotalCount });
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

// 每个类别的数据
export async function exploreAppData(page,size,filter) {
	page = page ? page : 1
    size = size ? size : 6
    let offset = (page - 1) * size
    size = offset + size - 1
	let select = supabase
	.from("app")
	.select("id,name,icon,description,points,link,images,appPlatforms,caption,is_forward,user_app(*)")
	.is('deleted', false)
	if (filter && filter.category_id && filter.category_id.length) {
		select = select.eq('category_id', filter.category_id)
	}
	select = select.order("updated_at", { ascending: false })
	let user = await islogin()
	if (user) {
		select = select.eq('user_app.user_id',user.id)
	}
	let { data, error } = await select.range(offset, size)
	if (error) {
		console.error("Error fetching data:", error);
		return;
	}
	return data;
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
		"id,name,is_forward,icon,description,points,category_id,link,images,appPlatforms,caption,ranking_in_category,rating,category(title),user_app(*)"
	)
	.eq("id", app_id)
	if (user) {
		select = select.eq('user_app.user_id',user.id)
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

export async function get_top_100(inviter_id,page,size) {
	page = page ? page : 1
    size = size ? size : 5
    let offset = (page - 1) * size
    size = offset + size - 1
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