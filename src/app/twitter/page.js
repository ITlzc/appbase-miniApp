"use client";

import { useEffect, useState, Suspense } from 'react';
import {
    islinkTwitter,
    linkTwitter,
    islogin,
    set_session
} from '../../lib/ton_supabase_api'
import CryptoJS from 'crypto-js';


export default function TwitterLink() {


    const get_session = (params) => {
        const secretKey = '6d2c2d1ab728f66fd7ab881926e4a46a';
        params = decodeURIComponent(params)
        const bytes = CryptoJS.AES.decrypt(params, secretKey);
        // console.log('get_session bytes = ',bytes)
        const decryptedMessage = bytes.toString(CryptoJS.enc.Utf8);
        if (!(decryptedMessage && decryptedMessage.length)) {
            return null
        }
        // console.log('get_session decryptedMessage = ',decryptedMessage)
        let session = JSON.parse(decryptedMessage)
        return session
    }

    const login = async (params) => {
        let user = await islogin()
        if (!user) {
            let session = get_session(params)
            if (session) {
                user = set_session(session)
            }
            
            console.log('login user_id = ',user)
        }
        return user
    }

    const do_link = async (params) => {
        // console.log('do_link params = ',params)
        let user = await login(params)
        if (user) {
            let data = await linkTwitter()
        }
    }
    
    useEffect(() =>{
        console.log('TwitterLink useEffect in')
        const params = new URLSearchParams(window.location.search);
        const startapp = params.get('params');
        // console.log('TwitterLink startapp = ',startapp)
        do_link(startapp)
        console.log('TwitterLink useEffect out')
    },[])

    return (
        <div>
            nihao
        </div>
    );
}