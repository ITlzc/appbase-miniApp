"use client";
import './styles/home.scss'
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Nav from './components/Nav';
import { toast } from 'react-toastify';
import { useAuth } from './auth_provider';



import {
  getAnnouncement,
  getRewardCount,
  recentUpdate,
  recommandData,
  exploreAppData,
  getCategorys,
  islogin,
  login,
  trailApp,
  trial_app_next_time,
  get_access_token,
  islinkTwitter,
  check_user_exist,
  cloud_remove_session,
  telegram_login,
  exploreAppDataFromCache,
  get_user_apps,
  getApp
} from '../lib/ton_supabase_api'
import Carousel from './components/Carousel';
import Link from 'next/link';
import { message, Spin } from 'antd';
import moment from 'moment';
import { task_host } from '../utils/supabase/config'



function HomeComponent() {

  // let temp = islogin().then(ets => {
  //   console.log('home islogin ets =',ets)
  // }).catch(e => {
  //   console.log('home islogin e=',e)
  // })
  // console.log('home islogin =',temp)

  const {authState} = useAuth()

  const router = useRouter();
  const searchParams = useSearchParams();

  const [appData, setAppData] = useState([]);
  const [loading, set_loading] = useState(false);

  const [announcement, set_announcement] = useState({});
  const [reward, set_reward] = useState({});
  const [recent_apps, set_recent_apps] = useState([]);
  const [recommand_apps, set_recommand_apps] = useState([]);
  const [explore_apps, set_explore_apps] = useState([]);
  const [all_apps, set_all_apps] = useState([]);
  const [all_total, set_all_total] = useState(0);
  const [categorys, set_categorys] = useState([]);

  const [currentCategory, setCurrentCategory] = useState('All')

  const [select_category, set_select_category] = useState({});


  const [page, set_page] = useState(1)
  const [size, set_size] = useState(3)

  const [recommand_page, set_recommand_page] = useState(1)
  const [recommand_size, set_recommand_size] = useState(3)

  const [start_param_by_query, set_start_param_by_query] = useState({})

  async function sumit_task(task) {
    let access_token = await get_access_token()
    console.log('access_token = ', access_token)
    if (!(access_token && access_token.length)) {
      toast.error('Please login first')
      return
    }
    let link = await islinkTwitter()
    if(!link) {
      return
    }
    let task_id = BigInt(task.taskId)
    console.log('sumit_task = ', task, task_id)
    let url = task_host + `/api/v1/task/submit/${task_id}`
    try {
      let response = await fetch(url, {
        method: "POST",
        headers: {
          authorization: "Bearer " + access_token
        }
      })
      console.log('sumit_task fetch = ', response)
      if (response && response.status == 200) {
        let responseData = await response.json()
        console.log('responseData =', responseData)
        if (responseData && responseData.code == 0) {
          return true
          // window.open(task.url, 'test', 'width=800,height=600,left=200,top=200')
        } else {
          // setTimeout(() => {
          //   message.error('Please login first')
          // },1000)
          // toast.error((responseData && responseData.msg) || (responseData && responseData.error) || 'submit task error')
          return false
        }
      } else {
        console.log('task_detail fetch error = ', response.statusText)
        return false
      }
    } catch (error) {
      console.log('fetch task detail error = ', error)
      return false
    }
  }

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
        // let session = await cloud_get_session()
        // console.log('cloud_get_session session = ',session)
        let flag = true
        // if (session && window.Telegram) {
        //   let temp_user = session.user
        //   let user = null
        //   try {
        //     user = await check_user_exist(temp_user.id)
        //     // console.log('anonymously_login user = ',user)
        //   } catch (error) {
        //     console.log('anonymously_login user error = ',error)
        //   }
        //   if (user) {
        //     flag = false
        //     // email_login('liuxuzhong5@ymyai.com','12345678')
        //     try {
        //       await set_session(session)
        //     } catch (error) {
        //       email_login('liuxuzhong5@ymyai.com','12345678')
        //       // localStorage.setItem('sb-api-auth-token',session)
        //     }
        //   } else {
        //     await cloud_remove_session()
        //   }
        // } 
        if (flag) {
          const tg = window.Telegram && window.Telegram.WebApp;
          if (tg) {
            console.log('before telegram_login')
            temp = await telegram_login(tg)
          } else {
            console.log('before login')
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
      console.log(`anonymously_login end time = ${new Date().getTime() - time}`)
    } catch (error) {
      console.log("anonymously_login error", error)
    } finally {
    }
  }

  const fetchReward = async () => {
    set_loading(true)
    let temp_reward = await getRewardCount()
    set_loading(false)
    console.log('fetchReward =', temp_reward)
    set_reward(temp_reward)
  }

  const fetchAnnouncement = async () => {
    set_loading(true)
    let temp_announcement = await getAnnouncement()
    set_loading(false)
    console.log('fetchAnnouncement =', temp_announcement)
    set_announcement(temp_announcement)
  }

  const deal_app = async (app) => {
    if (app.icon) {
      app.show_icon = app.icon.url
      if (app.show_icon.indexOf('http') < 0) {
        app.show_icon = 'https://jokqrcagutpmvpilhcfq.supabase.co/storage/v1/object/public' + app.show_icon
      }
    }
    // return
    const sortedData = app.user_app && app.user_app.length && app.user_app.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    // console.log('deal_app sortedData = ',sortedData)
    app.user_app = sortedData
    let user_app = sortedData && sortedData.length && sortedData[0]
    // let login = true
    // console.log('deal_app user_app = ',user_app)
    app.open_show = 'OPEN'
    // if (user_app ) {
      let status = user_app && user_app.status ? user_app.status : 0
      // console.log('deal_app status = ',status)
      app.status = status
      // if (login) {
      //   app.status = status
      // }
      
      if (user_app && user_app.updated_at) {
        let now = new Date().getTime()
        let update_time = moment(user_app.updated_at)
        // console.log('update_time =',update_time,typeof update_time)
        update_time = update_time.valueOf();
        if (status == 2 && now - update_time >= trial_app_next_time) {
          app.status = 0
        }
      }
      app.open_show = 'OPEN'
      if (app.points > 0) {
        if (app.status == 0) {
          app.open_show = 'OPEN'
        } else if (app.status == 1) {
          app.open_show = 'VERIFY'
        } else if (app.status == 2) {
          app.open_show = 'OPEN'
        }
      } else {
        app.open_show = 'OPEN'
      }
    // }
  }

  const fetchRecentApps = async (page, size) => {
    set_loading(true)
    let new_apps = await recentUpdate(page, size)
    set_loading(false)
    console.log('fetchRecentApps =', new_apps)
    for (let i = 0; i < new_apps.length; i++) {
      let app = new_apps[i]
      await deal_app(app)
    }
    set_recent_apps(new_apps)
    console.log('fetchRecentApps recent_apps =', recent_apps)

  }

  const fetchRecommandApps = async (page, size) => {
    console.log('fetchRecommandApps in = ', page, size)
    set_loading(true)
    let apps = await recommandData(page, size)
    set_loading(false)
    console.log('fetchRecommandApps =', apps)
    if (apps && apps.length) {
      set_recommand_page(page)
    }
    for (let i = 0; i < apps.length; i++) {
      let app = apps[i]
      await deal_app(app)
    }
    set_recommand_apps(apps)
  }

  const fetchPageExploreApps = async (page, size,apps) => {
    if (!(apps && apps.length)) {
      return
    }
    set_loading(true)
    page = page ? page : 1
    size = size ? size : 3
    let offset = (page - 1) * size
    size = offset + size
    // if (size > apps.length - 1) {
    //   size = apps.length - 1
    // }
    console.log('fetchPageExploreApps offset = ',offset,size)
    let temp_apps = apps.slice(offset, size);
    if (temp_apps && temp_apps.length) {
      set_page(page)
    }
    let app_ids = []
    for (let i = 0; i < temp_apps.length; i++) {
      let app = temp_apps[i]
      app_ids.push(app.id)
      // await deal_app(app)
    }
    await get_exploreApps_status(temp_apps,app_ids)
    let temp = explore_apps
    temp = temp.concat(temp_apps)
    if (page == 1) {
      temp = temp_apps
    }
    console.log('fetchPageExploreApps out =', temp_apps)
    set_explore_apps(temp)
    set_loading(false)
  }

  const fetchExploreApps = async (all_page,page,filter) => {
    set_loading(true)
    // let temp_apps = await exploreAppData(page, size, filter)
    // let tep_apps =
    let category_id = 'app_all'
    if (filter && filter.category_id && filter.category_id.length) {
      category_id = filter.category_id
    }
    let exapp_data = await exploreAppDataFromCache(category_id,all_page)
    set_loading(false)
    let temp_apps = exapp_data.apps
    console.log('fetchExploreApps =', temp_apps)
    // let temp = all_apps
    // temp = temp.concat(temp_apps)
    // if (all_page == 1) {
    //   temp = temp_apps
    // }
    // set_all_total(exapp_data.total_count)
    // set_all_apps(temp)
    // fetchPageExploreApps(page,size,temp)
    if (temp_apps && temp_apps.length) {
      set_page(page)
    }
    let app_ids = []
    for (let i = 0; i < temp_apps.length; i++) {
      let app = temp_apps[i]
      app_ids.push(app.id)
      await deal_app(app)
    }
    await get_exploreApps_status(temp_apps,app_ids)
    let temp = explore_apps
    temp = temp.concat(temp_apps)
    if (page == 1) {
      temp = temp_apps
    }
    console.log('fetchExploreApps out =', temp_apps)
    set_all_total(exapp_data.total_count)
    set_explore_apps(temp)
  }

  const get_exploreApps_status = async (apps,app_ids) => {
    try {
      // set_loading(true)
      const data = await get_user_apps(app_ids)
      // set_loading(false)
      for (const app of apps) {
        let user_apps = data.filter(e => e.app_id == app.id)
        if (user_apps && user_apps.length) {
          app.user_app = user_apps
        }
        await deal_app(app)
      }
    } catch (error) {
      console.log('get_exploreApps_status error = ',error)
    }
  }

  const get_apps = () => {
    let page_temp = page + 1
    let filter = {
      category_id: select_category && select_category.category_id && select_category.category_id.length ? select_category.category_id : null
    }
    fetchExploreApps(page_temp, page_temp, filter)
    // let offset = (page_temp - 1) * size
    // let temp_size = offset + size
    // console.log('get_apps = ',all_apps.length,temp_size,offset)
    // if (all_apps.length >= temp_size || all_apps.length >= all_total) {
    //   fetchPageExploreApps(page_temp,size,all_apps)
    // } else {
    //   let all_page = Math.ceil(all_apps.length / 30)
    //   fetchExploreApps(all_page, page_temp, filter)
    // }
  }

  const fetchCategorys = async () => {
    set_loading(true)
    let category = await getCategorys()
    set_loading(false)
    if (category && category.length) {
      let category_temp = category[0]
      set_select_category(category_temp)
      setCurrentCategory(category_temp.name)
    }
    console.log('fetchCategorys =', category)
    set_categorys(category)
  }

  const to_mini_app = () => {
    router.push(`/explore_apps`);
  }

  const more_app = async (type) => {
    console.log('more_app in = ', type)
    router.push(`/explore/${type}`);
  }

  const to_detail = async (app) => {
    console.log('to_detail in = ', app)
    if (app.is_forward) {
      open_app(app)
      return
    }
    const app_id = app.id
    router.push(`/appsDetail/${app_id}`);
  }

  const open_app = async (app) => {
    console.log('open_app in = ', app)
    

    let link = null
    if (app.link && app.link.length && app.link !== 'https://') {
      link = app.link
    }
    let login = await islogin()
    if (!login) {
        // if (link) {
        //     window.open(link)
        // }
        toast.error('Not login,Please refresh the page. ')
        
        return
    }
    if (app.status == 2) {
      let user_app = app && app.user_app && app.user_app.length && app.user_app[0]
      // console.log('startTimer = ',appData)
      let now = new Date().getTime()
      let update_time = moment(user_app && user_app.updated_at)
      update_time = update_time.valueOf();
      let duration = moment.duration((update_time + trial_app_next_time) - now);
      let formattedTime = duration.hours().toString().padStart(2, '0') + ":" +
          duration.minutes().toString().padStart(2, '0') + ":" +
          duration.seconds().toString().padStart(2, '0');
      toast.info(`Next Trial2Earn opportunity in ${formattedTime}`)
      return
    }
    if (app.status == 1) {
      let user_app = app && app.user_app && app.user_app.length && app.user_app[0]
      // console.log('startTimer = ',appData)
      let now = new Date().getTime()
      let update_time = moment(user_app && user_app.updated_at)
      update_time = update_time.valueOf();
      let duration = Math.floor(60 - ((now - update_time) / 1000))
      toast.info(`After ${duration} seconds can verify`)
      return
    }
    let flag = false
    if (app.points > 0) {
      if (app.status == 0 || app.status == 2) {
        console.log('open_app flag sssssss = ',flag,link)
        flag = true
      }
      let temp = await trailApp(app)
      trail_data(app)
    } else {
      flag = true
    }
    console.log('open_app flag = ',flag,link)
    if (flag) {
      window.open(link)
      flag = false
    }
  }

  const trail_data = async (app) => {
    let temp_app = await getApp(app.id)
    if (temp_app) {
      app.user_app = temp_app.user_app
    }
    let temp = JSON.parse(JSON.stringify(explore_apps))
    let index = temp.findIndex(e => e.id == temp_app.id)
    if (index > -1) {
      // temp[index] = temp_app
      await deal_app(temp_app)
      temp.splice(index,1,temp_app)
      set_explore_apps(temp)
    }
    

    let temp1 = JSON.parse(JSON.stringify(recommand_apps))
    let index1 = temp1.findIndex(e => e.id == temp_app.id)
    if (index1 > -1) {
      // temp[index] = temp_app
      await deal_app(temp_app)
      temp1.splice(index1,1,temp_app)
      set_recommand_apps(temp1)
    }
  }

  const switch_recommend = () => {
    console.log('switch_recommend in')
    let page = recommand_page + 1
    fetchRecommandApps(page, recommand_size)
  }

  const switch_category = (category) => {
    console.log('switch_category in', category)
    set_page(1)
    set_explore_apps([])
    set_select_category(category)
    setCurrentCategory(category.name)
    // fetchExploreApps(page, size, {
    //   category_id: category && category.category_id && category.category_id.length ? category.category_id : null
    // })
  }

  const do_task = async () => {
    let task = localStorage.getItem('need_do_task')
    if (task) {
      if (typeof task == 'string') {
        task = JSON.parse(task)
      }
      let link = await islinkTwitter()
      if(!link) {
        localStorage.removeItem('need_do_task')
        return
      }
      let flag = await sumit_task(task)
      console.log('sumit_task back = ', flag)
      if (flag) {
        window.open(task.url, 'test', 'width=800,height=600,left=200,top=200')
      }
      localStorage.removeItem('need_do_task')
    }
  }

  useEffect(() => {
    const value_ = searchParams.get('startapp')
    set_start_param_by_query(value_)
  }, [searchParams])

  useEffect(() => {
    console.log('useEffect page in = ', page, explore_apps, select_category)
    if (!select_category.hasOwnProperty('category_id')) {
      return
    }
    let category_id = select_category && select_category.category_id && select_category.category_id.length ? select_category.category_id : null
    fetchExploreApps(1,page, {
      category_id: category_id
    })
    console.log('useEffect page out = ', page, explore_apps, select_category)
  }, [select_category])

  const init_data = async () => {
    // let session = await cloud_get_session()
    // console.log('init_data cloud_get_session = ',session)
    // await anonymously_login()
    get_datas()
    // fetchExploreApps(page, size)
  }

  const get_datas = async () => {
    fetchCategorys()
    fetchAnnouncement()
    // fetchReward()
    // fetchRecentApps()

    fetchRecommandApps(recommand_page, recommand_size)

  }

  useEffect(() => {
    console.log('useEffect authState = ',authState)
    if (authState) {
      init_data()
    }
  }, [authState])

  const do_init_data = async () => {
    // await init_data()
    let error_description = searchParams.get('error_description');

    if (error_description && error_description.length && error_description.indexOf('+') > -1) {
      error_description = decodeURIComponent(error_description && error_description.replace(/\+/g, ' '));
    }
    if (error_description && error_description.length) {
      toast.error(error_description)
      localStorage.removeItem('need_do_task')
    } else {
      do_task()
    }
  }

  const initializeTelegram = () => {
    if (window.Telegram) {
      const tg = window.Telegram.WebApp;
      // console.log('tg.initData =', tg, tg.initData, tg.initDataUnsafe)
      if (process.env.tg_mini_env == 'true' && !(tg && tg.initData)) {
        //todo 跳转到 报错页面
        router.replace(`/notInMiniapp`)
        return
      }

      // 获取 initData 并设置到状态
      // setInitData(tg.initData);

      // tg.ready();
      do_init_data()

      // let start_param = tg.initDataUnsafe.start_param
      //     const decodedText = Buffer.from(start_param, 'base64').toString('utf-8');
      //     const urlParams = new URLSearchParams(decodedText);
      //     const inviterId = urlParams.get('inviter_id');
      //     console.log('initializeTelegram inviterId = ',inviterId)
    }
    
  };

  useEffect(() => {
    console.log('useEffect  home in = ', window.Telegram)
    initializeTelegram();
    // if (!window.Telegram) {
    //   if (process.env.tg_mini_env == 'false') {
    //     // 开发环境的逻辑
    //     console.log("Running in development mode");
    //     do_init_data()
    //     return
    //   }
    //   const script = document.createElement('script');
    //   script.src = 'https://telegram.org/js/telegram-web-app.js';
    //   script.async = true;
    //   script.onload = () => initializeTelegram();
    //   document.head.appendChild(script);
    // } else {
    //   initializeTelegram();
    // }
    console.log('useEffect home out')
  }, [])

  return (
    // <Suspense fallback={<div>Loading...</div>}>
      <div>
        <Spin size="large" spinning={loading}>
          <div className="page flex-col">
            <div className="section_1 flex-row">
              <div className="box_1 flex-col">
                <img
                  className="image_1"
                  src={"/images/FigmaDDSSlicePNG0e497c8e12d106821f46d93a1afb0ed8.png"}
                />
                {
                  announcement && announcement.comment && announcement.comment.length &&
                  <div className="box_2 flex-row">
                    <div className="image-text_1 flex-row justify-between">
                      <img
                        className="label_1"
                        src={"/images/FigmaDDSSlicePNG096263fcbde432adfa2ba91527589cd3.png"}
                      />
                      <span className="text-group_1">{announcement.comment}</span>
                    </div>
                  </div>
                }
                <div className="box_3 flex-row justify-between">
                  <span className="text_1">Trial to Earn</span>
                  {/* <img
                    className="label_2"
                    src={
                      "/images/7976996489c34446a0275580f091d0c8_mergeImage.png"
                    }
                  /> */}
                </div>
                <Carousel />
                <div className="box_4 flex-row justify-between">
                  <div className="text-group_2 flex-col justify-between">
                    <span className="text_2">Recommend</span>
                    <span className="text_3">Open the Apps to receive rewards</span>
                  </div>
                  <div className="image-wrapper_2 flex-col cursor-pointer" onClick={() => switch_recommend()}>
                    <img
                      className="label_3"
                      src={"/images/FigmaDDSSlicePNG9fbd43fc7a9d8fa0c74030dc0fdadedb.png"}
                    />
                  </div>
                </div>
                <div className="box_5 flex-col justify-between">
                  {
                    recommand_apps.map(app => {
                      return (
                        <div className="box_6 flex-col" key={app.id} onClick={() => to_detail(app)}>
                          <div className="image-text_2 flex-row justify-between">
                            <img
                              className="image_3"
                              src={app.show_icon}
                            />
                            <div className="text-group_3 flex-col justify-between">
                              <span className="text_4">{app.name}</span>
                              <span className="text_5">{app.caption}</span>
                            </div>
                          </div>
                          <div className="group_1 flex-row justify-between">
                            <div className="image-text_3 flex-row justify-start align-center">
                              <img
                                className="label_4"
                                src={"/images/FigmaDDSSlicePNG1673cd6906eef5efc28148f23f03837e.png"}
                              />
                              <span className="text-group_4">+{app.points / 1000000} points</span>
                            </div>
                            <div className={`text-wrapper_1 flex-col align-center justify-center ${app.status === 1 && 'status_verify'}`}>
                              <span className="text_6">{app.open_show}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  }

                </div>
              </div>
              <div className="box_11 flex-col">
                <div className="box_12 flex-row justify-between">
                  <div className="text-group_8 flex-col justify-between">
                    <span className="text_13">Explore Apps</span>
                    <span className="text_14">Discover more applications and receive rewards</span>
                  </div>
                  <Link href="/searchApps">
                    <img
                      className="label_6"
                      src={
                        "/images/a655361cc2f74b6da44e147da26d5741_mergeImage.png"
                      }
                    />
                  </Link>
                </div>
                <div className="box_13 flex-row flex-row flex-wrap justify-start">
                  {
                    categorys.map(cate => {
                      return (
                        <div className={`group_3 flex-col justify-center ${cate.name === currentCategory ? 'category_active' : ''}`} key={cate.category_id} onClick={() => switch_category(cate)}>
                          <div className="text-wrapper_4 justify-center align-center">
                            <span className="text_15">{cate.name}</span>
                            <span className="text_17">{cate.count}</span>
                          </div>
                        </div>
                      )
                    })
                  }
                </div>


                <div className="box_15 flex-col justify-between">
                  {
                    explore_apps.map(app => {
                      return (
                        <div className="section_2 flex-col" key={app.id} onClick={() => to_detail(app)}>
                          <div className="box_16 flex-row justify-between">
                            <img
                              className="image_6"
                              src={app.show_icon}
                            />
                            <div className="text-wrapper_10 flex-col justify-between">
                              <span className="text_33">{app.name}</span>
                              <span className="text_34">{app.caption}</span>
                            </div>
                          </div>
                          <div className="box_17 flex-row justify-between">
                            <div className="image-text_6 flex-row justify-start align-center">
                              <img
                                className="label_7"
                                src={"/images/FigmaDDSSlicePNG3c714d11d0b0a116dee95c4b280b3e63.png"}
                              />
                              <span className="text-group_9">+{app.points / 1000000}</span>
                            </div>
                            <div className={`text-wrapper_11 flex-col justify-center align-center ${app.status === 1 && 'status_verify_black'}`}>
                              <span className="text_35">{app.open_show}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  }
                </div>
                {
                  explore_apps.length < all_total ? <img
                    className="label_9" onClick={() => get_apps()}
                    src={"/images/FigmaDDSSlicePNGb18e199049345d6928d4f27512d0e917.png"}
                  /> : null
                }
                <Nav />
              </div>
            </div>
          </div>
        </Spin>
      </div>
    // </Suspense>

  );
}

export default function Home() {
  return (
      <Suspense fallback={<div>Loading...</div>}>
          <HomeComponent />
      </Suspense>
  );
}
