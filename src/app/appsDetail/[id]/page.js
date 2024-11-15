"use client";

import '../../styles/appsDetail.scss'
import { useEffect, useState, use, useRef } from 'react';
import { useRouter } from 'next/navigation';

import {
    getApp,
    trailApp,
    trial_app_next_time
} from '../../../lib/ton_supabase_api'

import { Spin } from 'antd';
import moment from 'moment';
import TipModel from '@/app/components/TipModel';




export default function AppsDetail({ params }) {
    const router = useRouter();
    const unwrappedParams = use(params); // 解包 params
    const [appData, setAppData] = useState({});
    const [open_show,set_open_show] = useState('')
    const timerRef = useRef(null);
    const id = unwrappedParams.id
    console.log('AppInfo id = ', id)

    const [platforms_map] = useState({
        "web": "Web",
        "ios": "IOS",
        "android": "Android",
        "tg_bot": "Telagram",
        // "tg_chat": "Telagram",
        // "tg_channel": "Telagram"
    })

    const [open_map] = useState({
        "web": "Web",
        "ios": "IOS",
        "android": "Android",
        "tg_bot": "Telagram-bot"
    })

    const [platforms] = useState(['Web',
        'Telagram',
        'IOS',
        'Android'])

    const [platforms_string, set_platforms_string] = useState('')

    const [office_links] = useState([
        'twitter',
        'inst',
        'youtube',
        'github',
        'web'
    ])

    const [office_links_icon_map] = useState({
        'twitter': '/images/twitter_icon.svg',
        'inst': '/images/instagram_icon.svg',
        'youtube': '/images/youtube_icon.svg',
        'github': '/images/github_icon.svg',
        'web': '/images/Web_icon.svg'
    })

    const [office_links_buttons, set_office_links_buttons] = useState([])

    const [telegrams, set_telegrams] = useState([])

    const [all_telegram] = useState([
        'tg_bot',
        'tg_chat',
        'tg_channel'
    ])

    const [loading, set_loading] = useState(false)

    const [open, setOpen] = useState(false);

    const [next_time, set_next_time] = useState('');

    const [only_open, set_only_open] = useState(true)

    const [open_buttons, set_open_buttons] = useState([])
    const [isExpanded, setIsExpanded] = useState(false);

    const [showOpenTip, setShowOpenTip] = useState(false);
    const [show_success_tip, set_show_success_tip] = useState(false);
    const [not_show_again, set_not_show_again] = useState(false);

    let in_page_start = false

    const handleToggle = () => {
        setIsExpanded(prev => !prev);
    };

    const hide = () => {
        setOpen(false);
    };

    const handleOpenChange = (newOpen) => {
        setOpen(newOpen);
    };

    const getLastPathSegment = (url) => {
        if (url.endsWith('/')) {
            url = url.slice(0, -1);
        }
        const parsedUrl = new URL(url);
        const pathParts = parsedUrl.pathname.split('/'); // 根据斜杠分割路径
        const lastPathSegment = pathParts[pathParts.length - 1]; // 获取最后一部分
        return lastPathSegment;
    };

    const startTimer = () => {
        if (timerRef.current) {
            // 如果定时器已经存在，先清除它
            clearInterval(timerRef.current);
        }
        // 启动新的定时器
        timerRef.current = setInterval(() => {
            let user_app = appData && appData.user_app && appData.user_app.length && appData.user_app[0]
            // console.log('startTimer = ',appData)
            let now = new Date().getTime()
            let update_time = moment(user_app.updated_at)
            update_time = update_time.valueOf();
            let duration = moment.duration((update_time + trial_app_next_time) - now);
            let formattedTime = duration.hours().toString().padStart(2, '0') + ":" +
                duration.minutes().toString().padStart(2, '0') + ":" +
                duration.seconds().toString().padStart(2, '0');
            // console.log('update_time duration =',duration,formattedTime)
            set_next_time(formattedTime)
        }, 1000);
    };

    const startVerifyTimer = (flag) => {
        console.log('startVerifyTimer')
        if (timerRef.current) {
            // 如果定时器已经存在，先清除它
            clearInterval(timerRef.current);
        }
        let user_app = appData && appData.user_app && appData.user_app.length && appData.user_app[0]
        
        let now = new Date().getTime()
        let update_time = moment(user_app.updated_at)
        update_time = update_time.valueOf();
        console.log('startVerifyTimer update_time = ',now - update_time)
        if (now - update_time >= 60 * 1000) {
            return
        }

        let count = 0
        if (!flag) {
            count = (now - update_time) / 1000
        }
        // 启动新的定时器
        timerRef.current = setInterval(() => {
            let user_app = appData && appData.user_app && appData.user_app.length && appData.user_app[0]
            let now = new Date().getTime()
            let update_time = moment(user_app.updated_at)
            update_time = update_time.valueOf();
            let duration = Math.floor(60 - count++) 
            let open_show = 'Verify and earn points(' + duration + 's)';
            if (duration <= 0){
                open_show = 'Verify and earn points';
            }
            console.log('startVerifyTimer open_show = ',open_show,now,update_time,(now - update_time) / 1000 )
            set_open_show(open_show)
            if (duration <= 0) {
                clearInterval(timerRef.current);
            }
        }, 1000);
    };

    const deal_app = (app) => {
        const sortedData = app.user_app.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        // console.log('deal_app sortedData = ',sortedData)
        app.user_app = sortedData
        let user_app = sortedData && sortedData.length && sortedData[0]
        let status = user_app && user_app.status
        app.status = status
        let now = new Date().getTime()
        let update_time = moment(user_app.updated_at)
        // console.log('update_time =',update_time,typeof update_time)
        update_time = update_time.valueOf();
        if (status == 2 && now - update_time >= trial_app_next_time) {
            app.status = 0
        }
        if (app.points > 0) {
            if (app.status == 0) {
                set_open_show('Open app to earn points')
            } else if (app.status == 1) {
                set_open_show('Verify and earn points')
            } else if (app.status == 2) {
                set_open_show('Open')
                let duration = moment.duration((update_time + trial_app_next_time) - now);
                let formattedTime = duration.hours().toString().padStart(2, '0') + ":" +
                    duration.minutes().toString().padStart(2, '0') + ":" +
                    duration.seconds().toString().padStart(2, '0');
                // console.log('update_time duration =',duration,formattedTime)
                set_next_time(formattedTime)
            }
        } else {
            set_open_show('Open')
        }


        if (app && app.icon) {
            app.show_icon = app.icon.url
            if (app.show_icon.indexOf('http') < 0) {
                app.show_icon = 'https://jokqrcagutpmvpilhcfq.supabase.co/storage/v1/object/public' + app.show_icon
            }
        }

        let temp = []
        let open_buttons_temp = []
        let office_links_buttons_temp = []
        let telefram_link = []
        app && app.appPlatforms && Object.keys(app && app.appPlatforms).map(key => {
            console.log("key = ", key, platforms_map[key], platforms.indexOf(platforms_map[key]))
            if (platforms.indexOf(platforms_map[key]) > -1) {
                if (temp.indexOf(platforms_map[key]) < 0) {
                    temp.push(platforms_map[key])
                }
            }

            if (open_map.hasOwnProperty(key)) {
                open_buttons_temp.push({
                    link: app.appPlatforms[key],
                    title: open_map[key]
                })
            }

            if (office_links.indexOf(key) > -1) {
                let title = ''
                if (key == 'github') {
                    title = 'Github'
                } else if (key == 'web') {
                    title = 'website'
                } else {
                    title = getLastPathSegment(app.appPlatforms[key])
                    if (!title.startsWith('@')) {
                        title = '@' + title
                    }
                }
                office_links_buttons_temp.push({
                    icon: office_links_icon_map[key],
                    link: app.appPlatforms[key],
                    title: title
                })
            }

            if (all_telegram.indexOf(key) > -1) {
                let title = getLastPathSegment(app.appPlatforms[key])
                if (!title.startsWith('@')) {
                    title = '@' + title
                }
                telefram_link.push({
                    icon: '',
                    link: app.appPlatforms[key],
                    title: title
                })
            }
        })
        let temp_string = temp.join(',')
        set_platforms_string(temp_string)

        set_office_links_buttons(office_links_buttons_temp)

        set_telegrams(telefram_link)


        let flag = false
        set_open_buttons(open_buttons_temp)
        if (open_buttons_temp.length == 1) {
            flag = true
        } else if (open_buttons_temp.length > 1) {
            flag = false
        }
        if (app.link && app.link.length && app.link !== 'https://') {
            flag = true
        }
        console.log('deal_app flag = ', flag, open_buttons_temp, app.link)
        set_only_open(true)
    }

    const to_explore = () => {
        console.log('to_explore in')
        router.push(`/explore/2/${appData.category_id}`);
    }


    const appInfo = async (app_id) => {
        set_loading(true)
        let app = await getApp(app_id)
        set_loading(false)
        console.log('appInfo = ', app, app.description.length)
        if (app.description && app.description.length > 246) {
            setIsExpanded(false)
        } else {
            setIsExpanded(true)
        }
        deal_app(app)
        setAppData(app)

    }

    useEffect(() => {
        console.log('useEffect appData in')
        if (appData.status == 2) {
            startTimer()
        }
        if (appData.status == 1) {
            startVerifyTimer(in_page_start)
        }
        console.log('useEffect appData out')
    }, [appData])

    const dela_open_app = async () => {
        let link = null
        setShowOpenTip(false)
        if (appData.link && appData.link.length && appData.link !== 'https://') {
            link = appData.link
        }
        let flag = false
        in_page_start = true
        if (appData.points > 0) {
            if (appData.status == 0 || appData.status == 2) {
                flag = true
            }
            let temp = await trailApp(appData)
            if (appData.status == 1 && temp == 2) {
                set_show_success_tip(true)
            }
            appInfo(id)
        } else {
            flag = true
        }
        if (flag) {
            window.open(link)
        }
    }

    const open_app = async (index) => {
        console.log('open_app in = ', index)
        if (appData.status == 0) {
            if (not_show_again) {
                dela_open_app()
            } else {
                setShowOpenTip(true)
            }
            return
        }
        dela_open_app()
    }

    const click_office = (office) => {
        window.open(office.link)
    }

    const open_platform_link = (link) => {
        console.log('open_platform_link in = ', link)
        window.open(link)
    }

    const init_data = async () => {
        appInfo(id)
    }

    const set_show_again = (state) => {
        localStorage.setItem('not_show_again', state)
        set_not_show_again(state)
    }

    useEffect(() => {
        console.log('useEffect in')
        let temp = localStorage.getItem('not_show_again')
        set_not_show_again(temp)

        init_data()
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
        console.log('useEffect out')
    }, [])

    return (
        <Spin size="large" spinning={loading}>
            <div className="appsDetail flex-col">
                <div className="box_1 flex-col">
                    <div className="group_1 flex-row justify-between">
                        <img
                            className="label_1"
                            src={"/images/FigmaDDSSlicePNG6d6c8d24c772d2f9bdce76ae48fa9188.png"}
                            onClick={() => router.back()}
                        />

                        <div className="image-wrapper_1 flex-col">
                            <img
                                className="label_2"
                                src={"/images/FigmaDDSSlicePNGe50a0f16cd394ba8300f460445076490.png"}
                            />
                        </div>
                    </div>
                    {
                        appData.status === 2 ?
                            <div className="text-group_1 flex-col justify-between align-center">
                                <span className="text_1">Next Trial2Earn opportunity in</span>
                                <span className="text_2">{next_time}</span>
                            </div> :
                            <div className="text-group_1 flex-col justify-between align-center">
                                <span className="text_1">Trial to Earn</span>
                                <span className="text_2">{appData.points ? appData.points / 1000000 : 0} Points</span>
                            </div>
                    }
                    {/* <div className="text-group_1 flex-col justify-between">
                        <span className="text_1">Trial to Earn</span>
                        <span className="text_2">{appData.points ? appData.points / 1000000 : 0} Points</span>
                    </div> */}
                    <div className="image-text_1 flex-row justify-between">
                        <img
                            className="image_1"
                            src={appData.show_icon}
                        />
                        <div className="text-group_2 flex-col ">
                            <span className="text_3">{appData.name}</span>
                            <span className="text_4">{appData.caption}</span>
                        </div>
                    </div>
                    <div className="text-wrapper_1 flex-row justify-between">
                        <div className="text-wrapper_1_item flex-col align-center justify-center">
                            <span className="text_5">Grade</span>

                            <div className="image-text_2 flex-row justify-center align-center">
                                <span className="text-group_3">{appData.rating}</span>
                                <img
                                    className="label_3"
                                    src={"/images/FigmaDDSSlicePNGec1e5e52e054c65d92e08ad6a95a93bd.png"}
                                />
                            </div>
                        </div>

                        <div className="text-wrapper_1_item flex-col align-center justify-center">
                            <span className="text_5">Visits</span>
                            <span className="text_8">{appData.reviews_count}</span>
                        </div>

                        <div className="text-wrapper_1_item flex-col align-start justify-center">
                            <span className="text_5">Ranking in category</span>
                            <span className="text_8">#{appData.ranking_in_category}</span>
                        </div>
                    </div>
                    <div className="group_3 flex-row  justify-start">
                        {
                            appData && appData.images && appData.images.map((item, index) => {
                                let url = item.url
                                if (url.indexOf('http') < 0) {
                                    url = 'https://jokqrcagutpmvpilhcfq.supabase.co/storage/v1/object/public' + url
                                }
                                return (
                                    <img
                                        key={index}
                                        className="image_2"
                                        src={url}
                                    />
                                )
                            })
                        }
                    </div>
                    <div className="text-group_4 flex-col justify-between">
                        <span className="text_10">Application Description</span>
                        {/* <span className="text_11">
                            All money collected from participants is raffled back. Up to 90% of the entire bank is distributed by the blockchain algorithm and smart contract to the winners — We are more of a service for raffles than a lottery service!
                        </span> */}

                        <span className={`text_11 ${isExpanded ? 'expanded' : ''}`}>
                            {appData.description}
                        </span>
                    </div>
                    {!isExpanded && <img
                        className="label_4 cursor-pointer"
                        src={"/images/arrow-bottom.png"}
                        onClick={handleToggle}
                    />}
                </div>
                <div className="box_3 flex-col">
                    <div className="image-text_3 flex-row justify-between">
                        <img
                            className="label_5"
                            src={"/images/FigmaDDSSlicePNG58b728fdfa9deef3ac2ff03b66935db3.png"}
                        />
                        <div className="text-group_5 flex-col justify-between">
                            <span className="text_12">Platforms</span>
                            <span className="text_13">{platforms_string}</span>
                        </div>
                    </div>
                    <div className="image-text_4 flex-row justify-between">
                        <img
                            className="label_6"
                            src={"/images/FigmaDDSSlicePNG626a50c365854aab82abd834f03cc445.png"}
                        />
                        <span className="text-group_6">Official links</span>
                    </div>
                    <div className="group_4 flex-row flex-wrap justify-start">
                        {
                            office_links_buttons.map((office, index) => {
                                return (
                                    <div className="group_5 flex-row align-center justify-center" key={index}>
                                        <div className="image-text_5 flex-row align-center justify-center" onClick={() => click_office(office)}>
                                            <img className="thumbnail_1" src={office.icon} alt="" />
                                            <span className="text-group_7">{office.title}</span>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                    <div className="image-text_4 flex-row justify-between">
                        <img
                            className="label_6"
                            src={"/images/FigmaDDSSlicePNG9a215bb256c56e67d941d287e98a6bf8.png"}
                        />
                        <span className="text-group_6">Telegram</span>
                    </div>
                    <div className="group_4 flex-row flex-wrap justify-start">
                        {
                            telegrams.map((tg, index) => {
                                return (
                                    <div className="group_5 flex-row align-center justify-center" key={index}>
                                        <div className="image-text_5 flex-row align-center justify-center" onClick={() => click_office(tg)}>
                                            <span className="text-group_7">{tg.title}</span>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>


                    <div className="group_7 flex-row justify-between">
                        <img
                            className="label_7"
                            src={"/images/FigmaDDSSlicePNG018597360c8da86e453ff5058fe51f3b.png"}
                        />
                        <div className="text-wrapper_3">
                            <span className="text_15">
                                AppBase is not responsible for any of the apps in the catalog. Using this app you take your own risks. Read our
                            </span>
                            <span className="text_16"> Disclaimer Terms</span>
                            <span className="text_17"> and </span>
                            <span className="text_18">Privacy Policy</span>
                        </div>
                    </div>
                </div>
                <div className={`text-wrapper_4 flex-col align-center justify-center ${appData.status === 1 && 'status_verify'}`} onClick={open_app}>
                    <span className="text_19">{open_show}</span>
                </div>
            </div>

            {showOpenTip && <TipModel not_show_again isShowCheckAgain showAgainFunc={set_show_again} closeFunc={() => setShowOpenTip(false)} >
                <div className='modelContent flex-col justify-center align-center'>
                    <img
                        className="modelContent_image_2"
                        src={"/images/FigmaDDSSlicePNGd8ff42dedbe95a6eeb222fa81ed23700.png"}
                    />
                    <div className="modelContent_text-wrapper_1 flex-col justify-center align-center">
                        <span className="text_2">
                            Please return to AppBase and complete the verification after accomplishing a task to receive your reward.
                        </span>
                    </div>
                    <div className="modelContent_box_2 flex-row" onClick={dela_open_app}>
                        <div className="text-wrapper_2 flex-col justify-center align-center">
                            <span className="text_2">Open Now</span>
                        </div>
                    </div>
                </div>
            </TipModel>}

            {/* iphone 13 mini - 28 */}
            {show_success_tip && <TipModel isShowCheckAgain={false} closeFunc={() => set_show_success_tip(false)}>
                <div className='modelContent flex-col justify-center align-center'>
                    <img
                        className="modelContent_image_2"
                        src={"/images/FigmaDDSSlicePNG9fbb902f8e442a771b1fd2e37b3e0b4d.png"}
                    />
                    <div className="modelContent_text-wrapper_1 flex-col justify-center align-center">
                        <span className="text_1">
                            +{appData.points / 1000000} Points
                        </span>
                        <span className="text_2">
                            You have Successfully received the reward
                        </span>
                    </div>
                    <div className="modelContent_box_2 flex-row" onClick={() => { set_show_success_tip(false) }}>
                        <div className="text-wrapper_2 flex-col justify-center align-center">
                            <span className="text_2">Back</span>
                        </div>
                    </div>
                </div>
            </TipModel>}
        </Spin >
    );
}
