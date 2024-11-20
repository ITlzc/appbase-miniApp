
"use client";
import '../styles/inviteList.scss'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Spin } from 'antd';


import {
    get_share_link,
    islogin,
    get_user_info,
    get_reward_points,
    get_user_ferinds,
    isTelegramMiniAPP,
    getSubstring
} from '../../lib/ton_supabase_api'

export default function InviteList() {
    const router = useRouter()

    const [share_link, set_share_link] = useState('')
    const [user_info, set_user_info] = useState({})
    const [reward_points, set_reward_points] = useState(0)
    const [stage, set_stage] = useState(0)
    const [friends, set_friends] = useState([])
    const [page, set_page] = useState(1)
    const [size, set_size] = useState(1000)
    const [loading, set_loading] = useState(false)
    const [invite_link,set_invite_link] = useState('')



    const more_users = async () => {
        let user = await islogin()
        if (!user) {
            return
        }
        let page_temp = page + 1
        get_ferinds(user.id, page_temp)
    }

    const init_start_up = async (link) => {
        let user = await islogin()
        if (!user) {
            return
        }
        let start_up = 'inviter_id=' + user.id
        const encodedText = Buffer.from(start_up, 'utf-8').toString('base64');
        let inviteLink = (link || share_link) + encodedText;  // 邀请链接
        if (!window.Telegram && process.env.tg_mini_env == 'false') {
            console.log('window.location = ', window.location)
            inviteLink = window.location.origin + '?startapp=' + encodedText
            return inviteLink
        }
        return inviteLink
    }

    const invite_friend = async () => {
        if (!(share_link && share_link.length)) {
            return
        }
        const inviteLink = await init_start_up();  // 邀请链接
        const telegramShareURL = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent("快来加入我们！")}`;
        window.open(telegramShareURL, "_blank");
    }

    const copy_share_link = async () => {
        if (!(share_link && share_link.length)) {
            return
        }
        const inviteLink = await init_start_up();  // 邀请链接
        console.log('fsfsfsds')
        if (isTelegramMiniAPP()) {
            let tg = window.Telegram.WebApp
            tg.requestWriteAccess((data) => {
                console.log('requestWriteAccess ',data)
                if (data) {
                    navigator.clipboard.writeText(inviteLink).then(() => {
                        tg.showPopup({
                            title: "",
                            message: "copy success",
                            buttons: [{ text: "Done" }]
                        });
                    }).catch(e => {
                        tg.showPopup({
                            title: "",
                            message: e.message,
                            buttons: [{ text: "Done" }]
                        });
                    })
                } else {
                    tg.showPopup({
                        title: "",
                        message: 'permission denied',
                        buttons: [{ text: "Done" }]
                    });
                } 
            })
            
        } else {
            await navigator.clipboard.writeText(inviteLink);
            toast.success('copy success')
        }
    }

    const get_ferinds = async (user_id, page_in) => {
        set_loading(true)
        let temp_ferinds = await get_user_ferinds(user_id, page_in, size)
        set_loading(false)
        if (temp_ferinds && temp_ferinds.length) {
            set_page(page_in)
        }
        temp_ferinds.map(item => {
            if (!item.points) {
                item.points = 0
            }
            if (item.points == 'NaN') {
                item.points = 0
            }
        })
        let temp = friends
        temp = temp.concat(temp_ferinds)
        if (page_in == 1) {
            temp = temp_ferinds
        }
        set_friends(temp)
    }

    const init_data = async () => {
        set_loading(true)
        let link = await get_share_link()
        set_loading(false)
        set_share_link(link)
        let inviteLink = await init_start_up(link)
        set_invite_link(inviteLink)
        let user = await islogin()
        if (!user) {
            return
        }
        set_loading(true)
        let temp_user_info = await get_user_info(user.id)
        set_loading(false)
        set_user_info(temp_user_info)
        set_loading(true)
        let real_reward_points = await get_reward_points(user.id)
        set_loading(false)
        set_reward_points(real_reward_points || 0)
        set_stage(temp_user_info.verify_passed_count / 105)
        get_ferinds(user.id, page)
    }

    useEffect(() => {
        init_data()
    }, [])

    return (
        <Spin size="large" spinning={loading}>
            <div className="inviteList flex-col">
                <div className="box_1 flex-row justify-between">
                    <div className="image-text_1 flex-col justify-between">
                        <img
                            onClick={() => router.back()}
                            className="label_1"
                            src={"/images/FigmaDDSSlicePNG6d6c8d24c772d2f9bdce76ae48fa9188.png"}
                        />
                        <span className="text-group_1">Invite Friends</span>
                    </div>
                    {
                        user_info.invite_user_count ? <span className="text_1">{user_info.verify_passed_count} valid / {user_info.invite_user_count} friend</span>
                        : null
                    }
                    
                </div>
                <div className="list_1 flex-col">
                    {
                        friends.map((item, index) => {
                            return (
                                <div className="list-items_1-0 flex-row" key={index}>
                                    <div className="image-text_2-0 flex-row justify-between">
                                        <img
                                            className="image_1-0"
                                            src={item.avatar || "/images/user-avatar-full-fill.png"}
                                        />
                                        <span className="text-group_2-0">{item.name || getSubstring(item.id)}</span>
                                    </div>
                                    <span className="text_3-0">+{item.points / 1000000}</span>
                                </div>
                            )
                        })
                    }

                    {
                        friends && friends.length ? <img
                            className="label_2"
                            onClick={more_users}
                            src={"/images/arrow-bottom.png"}
                        /> : null
                    }

                    
                </div>
                <div className="box_2 flex-row justify-between">
                    <div className="text-wrapper_1 flex-col justify-center align-center" onClick={copy_share_link}>
                        <span className="text_4">Share Link</span>
                    </div>
                    <div className="text-wrapper_2 flex-col justify-center align-center">
                        {/* <span className="text_5">Invite Friends</span> */}
                        <a className="text_5" href={`https://t.me/share/url?url=${encodeURIComponent(invite_link)}`}>Invite Friends</a>
                    </div>
                </div>
            </div>
        </Spin>
        
    )
}