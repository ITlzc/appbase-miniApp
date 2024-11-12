"use client";
import '../styles/invite.scss'
import Nav from '../components/Nav';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';



import {
    get_share_link,
    islogin,
    get_user_info,
    get_reward_points,
    get_user_ferinds
} from '../../lib/ton_supabase_api'

export default function Invite() {

    const [share_link,set_share_link] = useState('')
    const [user_info,set_user_info] = useState({})
    const [reward_points,set_reward_points] = useState(0)
    const [stage,set_stage] = useState(0)
    const [friends,set_friends] = useState([])
    const [page,set_page] = useState(0)
    const [size,set_size] = useState(5)


    const init_start_up = async () => {
        let user = await islogin()
        if (!user) {
            return 
        }
        let start_up = 'inviter_id=' + user.id
        const encodedText =  Buffer.from(start_up, 'utf-8').toString('base64');
        let inviteLink = share_link + encodedText;  // 邀请链接
        if (!window.Telegram && !process.env.tg_mini_env) {
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
        const telegramShareURL = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent("快来加入我们！")}`;
        window.open(telegramShareURL, "_blank");
    }

    const copy_share_link = async () => {
        if (!(share_link && share_link.length)) {
            return
        }
        const inviteLink = await init_start_up();  // 邀请链接
        await navigator.clipboard.writeText(inviteLink);
        toast.success('copy success')
    }

    const get_ferinds = async (user_id,page_in) => {
        let temp_ferinds = await get_user_ferinds(user_id,page_in,size)
        if (temp_ferinds && temp_ferinds.length) {
            set_page(page_in)
        }
        set_friends(temp_ferinds)
    }

    const init_data = async () => {
        let link = await get_share_link()
        set_share_link(link)
        let user = await islogin()
        if (!user) {
            return 
        }
        let temp_user_info = await get_user_info(user.id)
        set_user_info(temp_user_info)
        let real_reward_points = await get_reward_points(user.id)
        set_reward_points(real_reward_points || 0)
        set_stage(temp_user_info.verify_passed_count / 105)
        get_ferinds(user.id,page)
    }

    useEffect(() =>{
        init_data()
    },[])

    return (
        <div className="invite flex-col justify-end">
            <div className="box_1 flex-row justify-between">
                <span className="text_1">Invite Friends</span>
                <img
                    className="label_1"
                    src={
                        "https://lanhu-dds-backend.oss-cn-beijing.aliyuncs.com/merge_image/imgs/a4f7d7e6db134d63b8e8c9b011448194_mergeImage.png"
                    }
                />
            </div>
            <div className="text-group_1 flex-col justify-between align-center">
                <span className="text_2">Total invitation points</span>
                <span className="text_3">{user_info.invite_points} Points</span>
            </div>
            <span className="text_4">Friend Rewards</span>
            <div className="list_1 flex-row">
                <div className="text-group_2-0 flex-col justify-between align-center">
                    <span className="text_5-0">Invitation Friend</span>
                    <span className="text_6-0">{user_info.verify_passed_count}</span>
                </div>
                <div className="text-group_2-1 flex-col justify-between align-center">
                    <span className="text_5-1">Get Points</span>
                    <span className="text_6-1">{reward_points}</span>
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
                                src={"https://lanhu-oss.lanhuapp.com/FigmaDDSSlicePNGcbd6357355fe49cd246713ae3b5a790d.png"}
                            />}
                        </div>
                        <div className='mount flex-row justify-center align-center'>
                            {false && <img
                                className="thumbnail_1"
                                src={"https://lanhu-oss.lanhuapp.com/FigmaDDSSlicePNGa9a79474f9ebdadf20e34c7cd5ca09d0.png"}
                            />}
                            <span>{true ? 'Get Rewards' : '+50,000'}</span>
                        </div>
                    </div>

                    <div className="stage-rewards-item flex-col justify-between align-center">
                        <span className='friendsNum'>50 Friends</span>
                        <div className={`roundItem flex-col justify-center align-center ${false && 'roundItem_act'}`}>
                            {false && <img
                                src={"https://lanhu-oss.lanhuapp.com/FigmaDDSSlicePNGcbd6357355fe49cd246713ae3b5a790d.png"}
                            />}
                        </div>
                        <div className='mount flex-row justify-center align-center'>
                            {true && <img
                                className="thumbnail_1"
                                src={"https://lanhu-oss.lanhuapp.com/FigmaDDSSlicePNGa9a79474f9ebdadf20e34c7cd5ca09d0.png"}
                            />}
                            <span>{false ? 'Get Rewards' : '+50,000'}</span>
                        </div>
                    </div>

                    <div className="stage-rewards-item flex-col justify-between align-center">
                        <span className='friendsNum'>100 Friends</span>
                        <div className={`roundItem flex-col justify-center align-center ${false && 'roundItem_act'}`}>
                            {false && <img
                                src={"https://lanhu-oss.lanhuapp.com/FigmaDDSSlicePNGcbd6357355fe49cd246713ae3b5a790d.png"}
                            />}
                        </div>
                        <div className='mount flex-row justify-center align-center'>
                            {true && <img
                                className="thumbnail_1"
                                src={"https://lanhu-oss.lanhuapp.com/FigmaDDSSlicePNGa9a79474f9ebdadf20e34c7cd5ca09d0.png"}
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
                <div className="text-wrapper_4 flex-col justify-center align-center" onClick={invite_friend}>
                    <span className="text_14">Invite Friends</span>
                </div>
            </div>
            {
                user_info.invite_user_count ? <span className="text_15">{user_info.verify_passed_count} valid / {user_info.invite_user_count} friend</span>
                : <div></div>
            }
            <div className="list_2 flex-col">
                {
                    friends.map(item => {
                        return (
                            <div className="list-items_1-0 flex-row">
                                <div className="image-text_2-0 flex-row justify-between">
                                    <img
                                        className="image_1-0"
                                        src={item.avatar}
                                    />
                                    <span className="text-group_4-0">{item.name}</span>
                                </div>
                                <span className="text_17-0">+{item.points}</span>
                            </div>
                        )
                    })
                }
            </div>
            {
                friends && friends.length ? <Link href="/inviteList">
                    <img
                        className="label_2"
                        src={"https://lanhu-oss.lanhuapp.com/FigmaDDSSlicePNG0cf94e7e31c332196f965ab9aa43c71a.png"}
                    />
                </Link> : <div></div>
            }
            <Nav />
        </div>
    )
}