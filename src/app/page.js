"use client";
import './styles/home.scss'
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Nav from './components/Nav';
import { toast } from 'react-toastify';

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
  get_access_token
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

  const router = useRouter();
  const searchParams = useSearchParams();

  const [appData, setAppData] = useState([]);
  const [loading, set_loading] = useState(false);

  const [announcement, set_announcement] = useState({});
  const [reward, set_reward] = useState({});
  const [recent_apps, set_recent_apps] = useState([]);
  const [recommand_apps, set_recommand_apps] = useState([]);
  const [explore_apps, set_explore_apps] = useState([]);
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
      let time = new Date().getTime()
      console.log(`anonymously_login start time = ${time}`)
      let temp = await islogin()
      console.log(`islogin end time = ${time}, temp =`, temp)
      if (!temp) {
        console.log(`login start time = ${time}`)
        let inviter_id = null
        let tg_user_info = null
        if (window.Telegram) {
          const tg = window.Telegram.WebApp;
          let start_param = tg.initDataUnsafe.start_param
          if (start_param) {
            const decodedText = Buffer.from(start_param, 'base64').toString('utf-8');
            const urlParams = new URLSearchParams(decodedText);
            const inviterId = urlParams.get('inviter_id');
            console.log('anonymously_login inviterId = ', inviterId)
            inviter_id = inviterId
          }
          tg_user_info = tg.initDataUnsafe.user
        } else {
          let start_param = start_param_by_query;
          if (start_param) {
            const decodedText = Buffer.from(start_param, 'base64').toString('utf-8');
            const urlParams = new URLSearchParams(decodedText);
            const inviterId = urlParams.get('inviter_id');
            console.log('anonymously_login inviterId = ', inviterId)
            inviter_id = inviterId
          }
        }
        temp = await login(inviter_id, tg_user_info)
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

  const deal_app = (app) => {
    if (app.icon) {
      app.show_icon = app.icon.url
      if (app.show_icon.indexOf('http') < 0) {
        app.show_icon = 'https://jokqrcagutpmvpilhcfq.supabase.co/storage/v1/object/public' + app.show_icon
      }
    }
    const sortedData = app.user_app && app.user_app.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    // console.log('deal_app sortedData = ',sortedData)
    app.user_app = sortedData
    let user_app = sortedData && sortedData.length && sortedData[0]
    // if (user_app) {
    let status = user_app && user_app.status
    app.status = status
    if (user_app && user_app.updated_at) {
      let now = new Date().getTime()
      let update_time = moment(user_app.updated_at)
      // console.log('update_time =',update_time,typeof update_time)
      update_time = update_time.valueOf();
      if (status == 2 && now - update_time >= trial_app_next_time) {
        app.status = 0
      }
    }
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
    new_apps.map(app => {
      deal_app(app)
    })
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
    apps.map(app => {
      deal_app(app)
    })
    set_recommand_apps(apps)
  }

  const fetchExploreApps = async (page, size, filter) => {
    set_loading(true)
    let temp_apps = await exploreAppData(page, size, filter)
    set_loading(false)
    console.log('fetchExploreApps =', temp_apps)
    if (temp_apps && temp_apps.length) {
      set_page(page)
    }
    temp_apps.map(app => {
      deal_app(app)
    })
    let temp = explore_apps
    temp = temp.concat(temp_apps)
    if (page == 1) {
      temp = temp_apps
    }
    set_explore_apps(temp)
  }

  const get_apps = () => {
    let page_temp = page + 1
    let filter = {
      category_id: select_category && select_category.category_id && select_category.category_id.length ? select_category.category_id : null
    }
    fetchExploreApps(page_temp, size, filter)
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

    let flag = false
    if (app.points > 0) {
      if (app.status == 0 || app.status == 2) {
        flag = true
      }
      let temp = await trailApp(app)
      trail_data()
    } else {
      flag = true
    }
    if (flag) {
      window.open(link)
    }
  }

  const trail_data = async () => {
    fetchRecommandApps(1, recommand_size)
    let category_id = select_category && select_category.category_id && select_category.category_id.length ? select_category.category_id : null
    fetchExploreApps(1, size, {
      category_id: category_id
    })
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
    fetchExploreApps(page, size, {
      category_id: category && category.category_id && category.category_id.length ? category.category_id : null
    })
  }

  const do_task = async () => {
    let task = localStorage.getItem('need_do_task')
    if (task) {
      if (typeof task == 'string') {
        task = JSON.parse(task)
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
    fetchExploreApps(page, size, {
      category_id: category_id
    })
    console.log('useEffect page out = ', page, explore_apps, select_category)
  }, [select_category])

  const init_data = async () => {
    await anonymously_login()
    fetchCategorys()
    fetchAnnouncement()
    // fetchReward()
    fetchRecentApps()

    fetchRecommandApps(recommand_page, recommand_size)

    // fetchExploreApps(page, size)
  }

  const do_init_data = () => {
    init_data()
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
      console.log('tg.initData =', tg, tg.initData, tg.initDataUnsafe)
      if (process.env.tg_mini_env == 'true' && !(tg && tg.initData)) {
        //todo 跳转到 报错页面
        router.replace(`/notInMiniapp`)
        return
      }

      // 获取 initData 并设置到状态
      // setInitData(tg.initData);

      tg.ready();

      // let start_param = tg.initDataUnsafe.start_param
      //     const decodedText = Buffer.from(start_param, 'base64').toString('utf-8');
      //     const urlParams = new URLSearchParams(decodedText);
      //     const inviterId = urlParams.get('inviter_id');
      //     console.log('initializeTelegram inviterId = ',inviterId)
    }
    do_init_data()
  };

  useEffect(() => {
    console.log('useEffect in = ', window.Telegram)
    if (!window.Telegram) {
      if (process.env.tg_mini_env == 'false') {
        // 开发环境的逻辑
        console.log("Running in development mode");
        do_init_data()
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
    console.log('useEffect out')
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
                  <img
                    className="label_2"
                    src={
                      "/images/7976996489c34446a0275580f091d0c8_mergeImage.png"
                    }
                  />
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
                            <div className="image-text_3 flex-row justify-between">
                              <img
                                className="label_4"
                                src={"/images/FigmaDDSSlicePNG1673cd6906eef5efc28148f23f03837e.png"}
                              />
                              <span className="text-group_4">+{app.points / 1000000} points</span>
                            </div>
                            <div className={`text-wrapper_1 flex-col align-center justify-center ${app.status === 1 && 'status_verify'}`} onClick={() => to_detail(app)}>
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
                            <div className="image-text_6 flex-row justify-between">
                              <img
                                className="label_7"
                                src={"/images/FigmaDDSSlicePNG3c714d11d0b0a116dee95c4b280b3e63.png"}
                              />
                              <span className="text-group_9">+{app.points / 1000000}</span>
                            </div>
                            <div className={`text-wrapper_11 flex-col justify-center align-center ${app.status === 1 && 'status_verify_black'}`} onClick={() => to_detail(app)}>
                              <span className="text_35">{app.open_show}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  }
                </div>
                <img
                  className="label_9" onClick={() => get_apps()}
                  src={"/images/FigmaDDSSlicePNGb18e199049345d6928d4f27512d0e917.png"}
                />
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
