"use client";

import '../styles/pointesRecord.scss'
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import moment from 'moment';
import { Spin } from 'antd';




import {
    get_points_record,
    islogin
} from '../../lib/ton_supabase_api'

export default function PointsRecord() {
    const router = useRouter();

    const [page,set_page] = useState(1)
    const [size,set_size] = useState(10)
    const [records,set_records] = useState([])
    const [loading, set_loading] = useState(false)


    const more_records = async () => {
        let page_in = page + 1
        get_recods(page_in)
    }

    const get_recods = async (page_in) => {
        let user = await islogin()
        if (!user) {
            return
        }
        set_loading(true)
        let data = await get_points_record(user.id,page_in,size)
        set_loading(false)

        if (data && data.length) {
            set_page(page)
        }
        data.map(item => {
            if (item.points_type == 3 || item.points_type == 4) {
                item.remark = 'Invite aFriend'
            }
            item.create_time = moment(item.created_at).format('YYYY/MM/DD HH:mm');
            item.image = ''
            if (item.points_type == 1) {
                item.image = '/images/FigmaDDSSlicePNG0d0603aa65afbdc24a41aa5ab7bcd2b2.png'
            }
            if (item.points_type == 2) {
                item.image = '/images/FigmaDDSSlicePNG5dcebf563306878dd57f6585ac2dc5b0.png'
            }
            if (item.points_type == 3 || item.points_type == 4) {
                item.image = '/images/FigmaDDSSlicePNGde9b42a4e7fbda8bcd8ef5a7065876f2.png'
            }
        })
        let temp = records
        temp = temp.concat(data)
        if (page_in == 1) {
            temp = data
        }
        set_records(temp)
    }

    useEffect(() => {
        get_recods(page)
    },[])

    return (
        <Spin size="large" spinning={loading}>
            <div className="pointsRecord flex-col">
                
                <div className="box_1 flex-row">
                    <div className="image-text_1 flex-col justify-between">
                        <img
                            onClick={() => router.back()}
                            className="label_1"
                            src={"/images/FigmaDDSSlicePNG6d6c8d24c772d2f9bdce76ae48fa9188.png"}
                        />
                        <span className="text-group_1">Points Record</span>
                    </div>
                </div>
                {
                    records.map(item => {
                        return (
                            <div className="box_2 flex-row justify-between" key={item.id}>
                                <div className="image-text_2 flex-row justify-between">
                                    <img
                                        className="image_1"
                                        src={item.image}
                                    />
                                    <div className="text-group_2 flex-col justify-between">
                                        <span className="text_1">{item.create_time}</span>
                                        <span className="text_2">{item.remark}</span>
                                    </div>
                                </div>
                                {
                                    item.direction_type == 1 ? <span className="text_3">+{item.points / 1000000}</span> :
                                    <span className="text_3 red_text">-{item.points / 1000000}</span>
                                }
                            </div>
                        )
                    })
                }
            </div>
        </Spin>
    )
}