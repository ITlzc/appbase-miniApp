"use client";
import '../styles/task.scss'
import Nav from '../components/Nav';
import { useEffect, useState, Suspense } from 'react';
import { message } from 'antd';
import { useSearchParams,useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Spin } from 'antd';



import {
    get_task_group,
    get_access_token,
    islinkTwitter,
    linkTwitter,
    bind_telegram
} from '../../lib/ton_supabase_api'
import moment from 'moment';
import { task_host } from '../../utils/supabase/config'

function TaskComponent() {

    const router = useRouter();


    const searchParams = useSearchParams();

    const [all_tasks, set_all_tasks] = useState([])
    const [loading, set_loading] = useState(false)


    const click_item = async (task) => {
        if (task.platform && task.platform === 'twitter') {
            let redirectTo = window.location.href
            if (redirectTo.indexOf('?') > -1) {
                let temp = redirectTo.split('?')
                redirectTo = temp && temp.length && temp[0]
            }
            try {
                let link = await islinkTwitter()
                console.log('islinkTwitter = ', link)
                if (!link) {
                    localStorage.setItem('need_do_task', JSON.stringify(task))
                    let data = await linkTwitter(redirectTo)
                    console.log('linkTwitter data = ', data)
                    return
                }
            } catch (error) {
                console.log('linkTwitter error = ', error)
                return
            }
        }

        await bind_telegram()
        
        if (task.status == 'pending') {
            await check_task(task)
            return
        }

        let flag = await sumit_task(task)
        console.log('sumit_task back = ', flag)
        if (flag) {
            init_data()
            window.open(task.url, 'test', 'width=800,height=600,left=200,top=200')
        }
    }

    async function sumit_task(task, in_effect) {
        let access_token = await get_access_token()
        console.log('access_token = ', access_token)
        if (!(access_token && access_token.length)) {
            toast.error('Please login first')
            return
        }
        let task_id = BigInt(task.taskId)
        console.log('sumit_task = ', task, task_id)
        let url = task_host + `/api/v1/task/submit/${task_id}`
        set_loading(true)
        try {
            let response = await fetch(url, {
                method: "POST",
                headers: {
                    authorization: "Bearer " + access_token
                }
            })
            console.log('sumit_task fetch = ', response)
            set_loading(false)
            if (response && response.status == 200) {
                let responseData = await response.json()
                console.log('responseData =', responseData)
                if (responseData && responseData.code == 0) {
                    return true
                } else {
                    toast.error((responseData && responseData.msg) || (responseData && responseData.error) || 'submit task error')
                    return false
                }
            } else {
                console.log('task_detail fetch error = ', response.statusText)
                return false
            }
        } catch (error) {
            set_loading(false)
            console.log('fetch task detail error = ', error)
            return false
        }
    }

    async function check_task(task) {
        let access_token = await get_access_token()
        console.log('access_token = ', access_token)
        if (!(access_token && access_token.length)) {
            message.error('Please login first')
            return
        }
        let task_id = BigInt(task.taskId)
        console.log('check_task = ', task, task_id)
        let url = task_host + `/api/v1/task/check/${task_id}`
        set_loading(true)
        try {
            let response = await fetch(url, {
                headers: {
                    authorization: "Bearer " + access_token
                }
            })
            console.log('check_task fetch = ', response)
            set_loading(false)
            if (response && response.status == 200) {
                let responseData = await response.json()
                console.log('responseData =', responseData)
                if (responseData && responseData.code == 0) {
                    init_data()
                    // selected_task.status = responseData.data.status
                    // if (responseData.data && responseData.data.status && responseData.data.status == 'success') {
                    //     complete_tip.value = true
                    // } else if (responseData.data && responseData.data.status && responseData.data.status == 'retry') {
                    //     redo_tip.value = true
                    // }
                } else {
                    console.log('submit task error')
                }
            } else {
                console.log('task_detail fetch error = ', response.statusText)
            }
        } catch (error) {
            set_loading(false)
            console.log('fetch task detail error = ', error)
        }
    }

    const get_tasks = async (group_array) => {
        // set_all_tasks([
        //     {
        //         "platform": "twitter",
        //         "action": "retweet",
        //         "description": "retweet twitters",
        //         "tweetId": 1800805503066661000,
        //         "reward": 100,
        //         "start": 1723734039,
        //         "end": 1727863728,
        //         "daily": false,
        //         button:'VERIFY'
        //     },
        //     {
        //         "platform": "twitter",
        //         "action": "like",
        //         "description": "like twitters",
        //         "tweetId": 1800805503066661000,
        //         "reward": 100,
        //         "start": 1723734039,
        //         "end": 1727863728,
        //         "daily": false,
        //         button:'START'
        //     },
        //     {
        //         "platform": "twitter",
        //         "action": "follow",
        //         "description": "follow twitters",
        //         "reward": 100,
        //         "start": 1723734039,
        //         "end": 1727863728,
        //         "daily": false,
        //         button:'RETRY'
        //     },
        //     {
        //         "platform": "telegram",
        //         "action": "join",
        //         "description": "join telegram groups",
        //         "reward": 100,
        //         "start": 1723734039,
        //         "end": 1727863728,
        //         "daily": false,
        //         button:'COMPLETED'
        //     },
        //     {
        //         "platform": "telegram",
        //         "action": "active",
        //         "description": "active telegram groups",
        //         "reward": 100,
        //         "start": 1723734039,
        //         "end": 1727863728,
        //         "daily": true,
        //         button:'COMPLETED'
        //     }
        // ])
        // return
        let access_token = await get_access_token()
        console.log('access_token = ', access_token)
        if (!(access_token && access_token.length)) {
            message.error('Please login first')
            return
        }

        let tasks = []
        let promises = []
        for (let i = 0; i < group_array.length; i++) {
            let temp = new Promise((resolve, reject) => {
                let group = group_array[i]
                let task_group_id = BigInt(group.task_group_id)
                console.log('get_tasks = ', group, task_group_id)
                let url = task_host + `/api/v1/group/${task_group_id}`
                try {
                    fetch(url, {
                        headers: {
                            authorization: "Bearer " + access_token
                        }
                    }).then(res => {
                        console.log('get_tasks res = ', res)
                        res.json().then(jsonData => {
                            console.log('get_tasks data = ', jsonData)
                            let data = jsonData.data
                            resolve(data && data.tasks || [])
                        }).catch(error => {
                            console.log('get_tasks error = ', error)
                            resolve([])
                        })
                    }).catch(error => {
                        console.log('get_tasks error = ', error)
                        resolve([])
                    })
                } catch (error) {
                    console.log('fetch task get_tasks error = ', group.task_group_id, error)
                    resolve([])
                }
            })
            promises.push(temp)
        }
        set_loading(true)
        Promise.all(promises).then(res => {
            set_loading(false)
            res = res && res.length && res.reduce((l, r) => {
                return l.concat(r);
            })

            for (let m = 0; m < res.length; m++) {
                let task = res[m]
                task.start_time = ''
                if (task.start) {
                    task.start_time = moment(task.start * 1000).format('YYYY-MM-DD');
                }
                task.end_time = ''
                if (task.end) {
                    task.end_time = moment(task.end * 1000).format('YYYY-MM-DD');
                }
                if (task.status == 'todo') {
                    task.button = 'START'
                }
                if (task.status == 'pending') {
                    task.button = 'VERIFY'
                }
                if (task.status == 'retry') {
                    task.button = 'RETRY'
                }
                if (task.status == 'success') {
                    task.button = 'COMPLETED'
                }

                if (task.platform == 'telegram' || task.platform == 'appbase' || task.platform == 'appbase') {
                    task.icon = '/images/telegram-black-icon.png'
                }
                if (task.platform == 'twitter') {
                    task.icon = "/images/FigmaDDSSlicePNG79a676008387c154efe0ca055a84127f.png"
                }

                
                tasks.push(task)
            }
            console.log("get_tasks out = ", tasks)
            set_all_tasks(tasks)
        }).catch(error => {
            set_loading(false)
            console.log('fetch get_tasks all error = ', error)
        })
    }

    const init_data = async () => {
        let group = await get_task_group()
        if (group && group.length) {
            get_tasks(group)
        }
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
        console.log('useEffect in')
        // const tg = window.Telegram && window.Telegram.WebApp;
        // if (process.env.tg_mini_env == 'true' && !tg) {
        //     //todo 跳转到 报错页面
        //     router.replace(`/notInMiniapp`)
        //     return
        // }
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
        console.log('useEffect out')
    }, [])

    return (
        // <Suspense fallback={<div>Loading...</div>}>
            <Spin size="large" spinning={loading}>
                <div className="task flex-col">
                    <div className="box_1 flex-row justify-between">
                        <span className="text_1">Trial to Earn</span>
                        {/* <img
                            className="label_1"
                            src={
                                "/images/7976996489c34446a0275580f091d0c8_mergeImage.png"
                            }
                        /> */}
                    </div>
                    <div className="list_1 flex-col">
                        {
                            all_tasks.map((task, index) => {
                                return (
                                    <div className="list-items_1-0 flex-row justify-between" key={index}>
                                        <div className="image-text_1-0 flex-row justify-between">
                                            <img
                                                className="image_1-0"
                                                src={task.icon}
                                            />
                                            <div className="text-group_1-0 flex-col justify-between">
                                                <span className="text_2-0">{task.description}</span>
                                                <span className="text_3-0">+{task.reward} Points</span>
                                            </div>
                                        </div>
                                        <div className={`text-wrapper_1-0 flex-col align-center justify-center ${task.button == 'START' ? 'status_is_start' : task.button == 'COMPLETED' ? 'status_is_completed' : ''}`} onClick={() => { click_item(task) }}>
                                            <span className="text_5-0">{task.button}</span>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                    <Nav />
                </div>
            </Spin>
        // </Suspense>

    );
}

export default function Task() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <TaskComponent />
        </Suspense>
    );
}