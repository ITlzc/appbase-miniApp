"use client";

import Nav from "../components/Nav";
import '../styles/avatar.scss'
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';




import {
    islogin,
    get_user_info,
    getSubstring
} from '../../lib/ton_supabase_api'



export default function Admin() {
    const router = useRouter();

    return (
        <div className="avatar flex-col">
            <div className="group_3 flex-col">
                <Link  href={'/manageapps'} className="box_6 flex-row justify-between">
                    <span className="text_19">Manage Apps</span>
                    <img className="group_4" src="/images/arrow-right.png" alt="" />
                </Link>
                <Nav />
            </div>
        </div>
    )
}