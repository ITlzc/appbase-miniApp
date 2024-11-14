"use client";
import Nav from "../components/Nav"
import '../styles/leader.scss'
import { useEffect, useState } from 'react';
import { Spin } from 'antd';



import {
    islogin,
    get_user_info,
    get_top_100,
    count_holders
} from '../../lib/ton_supabase_api'

export default function Leader() {

    const [user_info, set_user_info] = useState({})
    const [tops, set_tops] = useState([])
    const [page, set_page] = useState(1)
    const [size, set_size] = useState(5)
    const [holders, set_holders] = useState(0)
    const [all_points, set_all_points] = useState(0)
    const [loading, set_loading] = useState(false)



    const more_users = () => {
        let page_temp = page + 1
        get_tops(page_temp, size)
    }

    const get_tops = async (user_id, page_in) => {
        set_loading(true)
        let temp_ferinds = await get_top_100(user_id, page_in, size)
        set_loading(false)
        if (temp_ferinds && temp_ferinds.length) {
            set_page(page_in)
        }
        temp_ferinds.map(item => {
            item.all_points = item.earn_points + item.task_points + item.invite_points
            item.trophy = ''
            if (item.rank == 1) {
                item.trophy = '/images/FigmaDDSSlicePNG99b3bb57363533a416a7cc09f8c6490e.png'
            }
            if (item.rank == 2) {
                item.trophy = '/images/FigmaDDSSlicePNG5c03c631c93830eac5fe5ef349b3c5cc.png'
            }
            if (item.rank == 3) {
                item.trophy = '/images/FigmaDDSSlicePNGca28ff8ca2da02e2dc22302c80665fcb.png'
            }
        })
        let temp = tops
        temp = temp.concat(temp_ferinds)
        if (page_in == 1) {
            temp = temp_ferinds
        }
        set_tops(temp)
    }

    const init_data = async () => {
        let user = await islogin()
        if (!user) {
            return
        }
        set_loading(true)
        let temp_user_info = await get_user_info(user.id)
        set_loading(false)
        let temp_all_points = temp_user_info.earn_points + temp_user_info.task_points + temp_user_info.invite_points
        set_all_points(temp_all_points)
        set_user_info(temp_user_info)
        get_tops(user.id, page)

        set_loading(true)
        let count = await count_holders()
        set_loading(false)
        set_holders(count)
    }

    useEffect(() => {
        init_data()
    }, [])

    return (
        <Spin size="large" spinning={loading}>
            <div className="leader flex-col">
                <div className="group_1 flex-row justify-between">
                    <span className="text_1">Leaderboard</span>
                    <img
                        className="label_1"
                        src={
                            "/images/7976996489c34446a0275580f091d0c8_mergeImage.png"
                        }
                    />
                </div>
                <span className="text_2">My Ranking</span>
                <div className="group_2 flex-row justify-between">
                    <div className="flex-row">
                        <span className="text_3">#{user_info.rank}</span>
                        <img
                            className="image_1"
                            src={user_info.avatar || "/images/user-avatar-full-fill.png"}
                        />
                        <span className="text_4">{user_info.name}</span>
                    </div>
                    <span className="text_5">{all_points ? all_points / 1000000 : '~'}</span>
                </div>
                <div className="text-wrapper_1 flex-row justify-between">
                    <span className="text_6">TOP 100</span>
                    <span className="text_7">{holders} Holders</span>
                </div>
                <div className="list_1 flex-col">
                    {
                        tops.map((item, index) => {
                            return (
                                <div className="list-items_1-0 flex-row justify-between" key={index}>
                                    <div className="flex-row">
                                        {
                                            item.rank > 3 ? <span className="text_8-3">#{item.rank}</span> :
                                                <img
                                                    className="label_2-0"
                                                    src={item.trophy}
                                                />
                                        }
                                        <img
                                            className="image_2-0"
                                            src={item.avatar || "/images/user-avatar-full-fill.png"}
                                        />
                                        <span className="text_9-0">{item.name}</span>
                                    </div>
                                    <span className="text_10-0">{item.all_points / 1000000}</span>
                                </div>
                            )
                        })
                    }
                    {
                        tops && tops.length ? <img
                            className="label_2"
                            onClick={more_users}
                            src={"/images/arrow-bottom.png"}
                        /> : null
                    }
                </div>
                <Nav />
            </div>
        </Spin>
        
    )
}