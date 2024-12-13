"use client";

import Nav from "../components/Nav";
import '../styles/home.scss'
import { useEffect, useState } from 'react';
import { Popover, Spin } from 'antd';
import TipModel from '@/app/components/TipModel';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

import { toast } from 'react-toastify';


import {
    islogin,
    get_user_info,
    getSubstring,
    allApps,
    set_show
} from '../../lib/ton_supabase_api'



export default function ManageApps() {
    const router = useRouter();

    const [loading, set_loading] = useState(false)
    const [explore_apps, set_explore_apps] = useState([]);
    const [page, set_page] = useState(1)
    const [size, set_size] = useState(20)
    const [all_total, set_all_total] = useState(0);


    const to_set = async (app, flag) => {
        console.log('to_set in = ', app)
        let data = await set_show(app, flag)
        if (data) {
            toast.success('success')
        } else {
            toast.error('faild')
        }
        set_page(1)
        set_explore_apps([])
    }

    const deal_app = (app) => {
        if (app.icon) {
            app.show_icon = app.icon.url
            if (app.show_icon && app.show_icon.length && app.show_icon.indexOf('http') < 0) {
                app.show_icon = 'https://jokqrcagutpmvpilhcfq.supabase.co/storage/v1/object/public' + app.show_icon
              }
              if (!(app.show_icon && app.show_icon.length)) {
                app.show_icon = '/images/favicon.ico'
              }
        }
    }

    const fetchExploreApps = async (page) => {
        set_loading(true)
        let { count, data } = await allApps(page, size)
        set_loading(false)
        if (data && data.length) {
            set_page(page)
        }
        for (let i = 0; i < data.length; i++) {
            let app = data[i]
            await deal_app(app)
        }
        let temp = explore_apps
        temp = temp.concat(data)
        if (page == 1) {
            temp = data
        }
        console.log('fetchExploreApps out =', count, data)
        set_all_total(count)
        set_explore_apps(temp)
    }

    const get_apps = () => {
        let page_temp = page + 1
        fetchExploreApps(page_temp)
    }

    useEffect(() => {
        console.log('useEffect page in = ', page, explore_apps)
        if (page == 1 && explore_apps && explore_apps.length <= 0) {
            fetchExploreApps(page)
        }
        console.log('useEffect page out = ', page, explore_apps)
    }, [explore_apps])

    // useEffect(() => {
    //     fetchExploreApps(page)
    // },[])

    return (
        <Spin size="large" spinning={loading}>
            <div className="page flex-col">
                <div className="box_back flex-row">
                    <div className="image-text_1 flex-row justify-start align-center">
                        <img
                            onClick={() => router.back()}
                            className="label_1"
                            src={"/images/FigmaDDSSlicePNG6d6c8d24c772d2f9bdce76ae48fa9188.png"}
                        />
                        <span className="text-group_1">Manage Apps</span>
                    </div>
                </div>
                <div className="section_1 flex-row">
                    <div className="box_apps flex-col">
                        <div className="box_12 flex-row justify-between">
                            <div className="text-group_8 flex-col justify-between">
                                <span className="text_13">Explore Apps</span>
                                <span className="text_14">Discover more applications and receive rewards</span>
                            </div>
                            <Link href="/manageSearchApps">
                                <img
                                    className="label_6"
                                    src={
                                        "/images/a655361cc2f74b6da44e147da26d5741_mergeImage.png"
                                    }
                                />
                            </Link>
                        </div>

                        <div className="box_15 flex-col justify-between">
                            {
                                explore_apps.map(app => {
                                    return (
                                        <div className="section_2 flex-col" key={app.id}>
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
                                                <div className={`text-wrapper_11 flex-col justify-center align-center`} onClick={() => to_set(app, 1)}>
                                                    <span className="text_35">SHOW</span>
                                                </div>
                                                <div className={`text-wrapper_11 flex-col justify-center align-center status_verify_black`} onClick={() => to_set(app, 1)}>
                                                    <span className="text_35">HIDE</span>
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
    )
}