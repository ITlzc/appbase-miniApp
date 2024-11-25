"use client";
import '../styles/invite.scss'
import Nav from '../components/Nav';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { message, Spin } from 'antd';



import {
    get_share_link,
    islogin,
    get_user_info,
    get_reward_points,
    get_user_ferinds,
    isTelegramMiniAPP,
    getSubstring
} from '../../lib/ton_supabase_api'

export default function Invite() {

    const [share_link,set_share_link] = useState('')
    const [user_info,set_user_info] = useState({})
    const [reward_points,set_reward_points] = useState(0)
    const [stage,set_stage] = useState(0)
    const [friends,set_friends] = useState([])
    const [page,set_page] = useState(1)
    const [size,set_size] = useState(5)
    const [loading, set_loading] = useState(false)
    const [invite_link,set_invite_link] = useState('')



    const init_start_up = async (link) => {
        let user = await islogin()
        if (!user) {
            return 
        }
        let start_up = 'inviter_id=' + user.id
        const encodedText =  Buffer.from(start_up, 'utf-8').toString('base64');
        let inviteLink = (link || share_link) + encodedText;  // 邀请链接
        if (!window.Telegram && process.env.tg_mini_env == 'false') {
            console.log('window.location = ',window.location)
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
        const telegramShareURL = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}}`;
        try {
            window.open(telegramShareURL, "_blank");
        } catch (error) {
            if (isTelegramMiniAPP()) {
                let tg = window.Telegram.WebApp
                tg.showPopup({
                    title: "",
                    message: error.message,
                    buttons: [{ text: "确定" }]
                });
            } else {
                toast.success('copy success')
            }
        }
        
    }

    const copy_share_link = async () => {
        if (!(share_link && share_link.length)) {
            return
        }
        const inviteLink = await init_start_up();  // 邀请链接
        // await navigator.clipboard.writeText(inviteLink);
        if (isTelegramMiniAPP()) {
            let tg = window.Telegram.WebApp
            const userAgent = navigator.userAgent;
            console.log('tg info = ',window.Telegram,window.Telegram.WebApp,userAgent)
            message.error('copy success')
            tg.requestWriteAccess((data) => {
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

    const get_ferinds = async (user_id,page_in) => {
        set_loading(true)
        let temp_ferinds = await get_user_ferinds(user_id,page_in,size)
        set_loading(false)
        if (temp_ferinds && temp_ferinds.length) {
            set_page(page_in)
        }
        temp_ferinds.map(item => {
            if(!item.points) {
                item.points = 0
            }
            if(item.points == 'NaN') {
                item.points = 0
            }
        })
        set_friends(temp_ferinds)
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
        get_ferinds(user.id,page)
    }

    useEffect(() =>{
        init_data()
    },[])

    return (
        <Spin size="large" spinning={loading}>
            <div className="invite flex-col">
                
                <div className="box_1 flex-row justify-between">
                    <span className="text_1">Invite Friends</span>
                    {/* <img
                        className="label_1"
                        src={
                            "/images/7976996489c34446a0275580f091d0c8_mergeImage.png"
                        }
                    /> */}
                </div>
                <div className="text-group_1 flex-col justify-between align-center">
                    <span className="text_2">Total invitation points</span>
                    <span className="text_3">{user_info.invite_points ? user_info.invite_points / 1000000 : '0'} Points</span>
                </div>
                <span className="text_4">Friend Rewards</span>
                <div className="list_1 flex-row">
                    <div className="text-group_2-0 flex-col justify-between align-center">
                        <span className="text_5-0">Invitation Friend</span>
                        <span className="text_6-0">{user_info.verify_passed_count ? user_info.verify_passed_count : '0'}</span>
                    </div>
                    <div className="text-group_2-1 flex-col justify-between align-center">
                        <span className="text_5-1">Get Points</span>
                        <span className="text_6-1">{reward_points ? reward_points / 1000000 : '0'}</span>
                    </div>
                </div>
                <div className='stage-rewards flex-col justify-center align-center'>
                    <span className="text_7">Stage Rewards</span>
                    <div className="level flex-row justify-between">
                        <div className="progress">
                            <div className="progress_bar" style={{ width: `${stage}%` }}>
                                <div className="round"></div>
                            </div>
                        </div>

                        <div className="stage-rewards-item flex-col justify-between align-center">
                            <span className='friendsNum'>5 Friends</span>
                            <div className={`roundItem flex-col justify-center align-center ${true && 'roundItem_act'}`}>
                                {true && <img
                                    src={"/images/FigmaDDSSlicePNGcbd6357355fe49cd246713ae3b5a790d.png"}
                                />}
                            </div>
                            <div className='mount flex-row justify-center align-center'>
                                {false && <img
                                    className="thumbnail_1"
                                    src={"/images/FigmaDDSSlicePNG1673cd6906eef5efc28148f23f03837e.png"}
                                />}
                                <span>{true ? 'Get Rewards' : '+50,000'}</span>
                            </div>
                        </div>

                        <div className="stage-rewards-item flex-col justify-between align-center">
                            <span className='friendsNum'>50 Friends</span>
                            <div className={`roundItem flex-col justify-center align-center ${false && 'roundItem_act'}`}>
                                {false && <img
                                    src={"/images/FigmaDDSSlicePNGcbd6357355fe49cd246713ae3b5a790d.png"}
                                />}
                            </div>
                            <div className='mount flex-row justify-center align-center'>
                                {true && <img
                                    className="thumbnail_1"
                                    src={"/images/FigmaDDSSlicePNG1673cd6906eef5efc28148f23f03837e.png"}
                                />}
                                <span>{false ? 'Get Rewards' : '+50,000'}</span>
                            </div>
                        </div>

                        <div className="stage-rewards-item flex-col justify-between align-center">
                            <span className='friendsNum'>100 Friends</span>
                            <div className={`roundItem flex-col justify-center align-center ${false && 'roundItem_act'}`}>
                                {false && <img
                                    src={"images/FigmaDDSSlicePNGcbd6357355fe49cd246713ae3b5a790d.png"}
                                />}
                            </div>
                            <div className='mount flex-row justify-center align-center'>
                                {true && <img
                                    className="thumbnail_1"
                                    src={"/images/FigmaDDSSlicePNG1673cd6906eef5efc28148f23f03837e.png"}
                                />}
                                <span>{false ? 'Get Rewards' : '+100,000'}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="box_4 flex-row justify-between">
                    <div className="text-wrapper_3 flex-col justify-center align-center" onClick={copy_share_link}>
                        <span className="text_13">Share Link</span>
                    </div>
                    <div className="text-wrapper_4 flex-col justify-center align-center">
                        {/* <span className="text_14">Invite Friends</span> */}
                        <a className="text_14" href={`https://t.me/share/url?url=${encodeURIComponent(invite_link)}`}>Invite Friends</a>
                    </div>
                </div>
                {
                    user_info.invite_user_count ? <span className="text_15">{user_info.verify_passed_count} valid / {user_info.invite_user_count} friend</span>
                    : <div></div>
                }
                <div className="list_2 flex-col">
                    {
                        friends.map((item,index) => {
                            return (
                                <div className="list-items_1-0 flex-row" key={index}>
                                    <div className="image-text_2-0 flex-row justify-between">
                                        <img
                                            className="image_1-0"
                                            src={item.avatar || "/images/user-avatar-full-fill.png"}
                                        />
                                        <span className="text-group_4-0">{item.name || getSubstring(item.id)}</span>
                                    </div>
                                    <span className="text_17-0">+{item.points / 1000000}</span>
                                </div>
                            )
                        })
                    }
                </div>
                {
                    friends && friends.length ? <Link href="/inviteList">
                        <img
                            className="label_2"
                            src={"/images/arrow-bottom.png"}
                        />
                    </Link> : <div></div>
                }
                <Nav />
            </div>
        </Spin>
    )
}