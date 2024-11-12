"use client";
import { useRouter } from 'next/navigation';
import Link from 'next/link'
import { useEffect, useState } from 'react';


import '../styles/searchApps.scss'
import {
    searchData
} from '../../lib/ton_supabase_api'

import { Spin } from 'antd';

export default function SearchApps() {
    const router = useRouter();
    const [apps, set_apps] = useState([]);
    const [search_input, set_search_input] = useState('');
    const [loading, set_loading] = useState(false)

    const search = async (event) => {
        console.log('search in = ', event)
        let input = event.target.value
        set_search_input(input)
        // handleInputChange(event)
    }

    const deal_app = (app) => {
        if (app.icon) {
            app.show_icon = app.icon.url
            if (app.show_icon.indexOf('http') < 0) {
                app.show_icon = 'https://jokqrcagutpmvpilhcfq.supabase.co/storage/v1/object/public' + app.show_icon
            }
        }
    }

    useEffect(() => {
        console.log('useEffect page in = ', search_input)
        async function searchApps() {
            if (!(search_input && search_input.length)) {
                set_apps([])
                return
            }
            set_loading(true)
            let return_apps = await searchData(search_input)
            set_loading(false)
            return_apps.map(app => {
                deal_app(app)
            })
            console.log('search = ', return_apps)
            set_apps(return_apps)
        }
        searchApps()
        console.log('useEffect page out = ', search_input)
    }, [search_input])

    const to_detail = async (app) => {
        console.log('to_detail in = ', app)
        if (app.is_forward) {
            open_app(app)
            return
        }
        const app_id = app.id
        router.push(`/apps/${app_id}`);
    }

    const open_app = async (app) => {
        console.log('open_app in = ', app)
        if (app.link && app.link.length && app.link !== 'https://') {
            window.open(app.link)
        }
    }

    const clear_input = () => {
        set_search_input('')
    }

    return (
        <div className="searchApps flex-col">
            <Spin size="large" spinning={loading}></Spin>
            <div className="group_1 flex-row">
                <img className='backIcon' src="/images/arrow-left-f.png" alt="" onClick={() => router.back()} />
                <img
                    className="label_1"
                    src={"/images/search.png"}
                />
                <input type="text" onChange={search} className="text_1" />
                <img
                    className="label_2"
                    src={"/images/close.png"}
                    onClick={clear_input}
                />
            </div>
            <span className="text_2">Apps</span>
            <div className="group_2 flex-col justify-between">
                {
                    apps.map(app => {
                        return (
                            <div className="block_2 flex-col" onClick={() => to_detail(app)} key={app.id}>
                                <div className="image-text_3 flex-row justify-between">
                                    <img
                                        className="image_2"
                                        src={app.show_icon}
                                    />
                                    <div className="text-group_3 flex-col justify-between">
                                        <span className="text_6">{app.name}</span>
                                        <span className="paragraph_1">
                                            {app.caption}
                                        </span>
                                    </div>
                                </div>
                                <div className="section_1 flex-row justify-between">
                                    <div className="image-text_4 flex-row justify-between">
                                        <img
                                            className="label_4"
                                            src={"https://lanhu-oss.lanhuapp.com/FigmaDDSSlicePNG1673cd6906eef5efc28148f23f03837e.png"}
                                        />
                                        <span className="text-group_4">+{app.points / 1000000}coin</span>
                                    </div>
                                    <div className="text-wrapper_2 flex-col align-center justify-center" onClick={() => to_detail(app)}>
                                        <span className="text_7">OPEN</span>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }
               

                {false && <div className="noData flex-col align-center justify-center">
                    <img
                        className="image_1"
                        src={"https://lanhu-oss.lanhuapp.com/FigmaDDSSlicePNG0e497c8e12d106821f46d93a1afb0ed8.png"}
                    />
                    <img
                        className="image_2"
                        src={"https://lanhu-oss.lanhuapp.com/FigmaDDSSlicePNG9e8ff38e15f2ab39a44277130ce3bbbb.png"}
                    />
                    <span className="text_3">
                        The app you are searching for was not found
                    </span>
                </div>}
            </div>
        </div>
    )
}