"use client";

import '../styles/nav.scss'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';


export default function Nav() {
    const [currentPath, setCurrentPath] = useState('');

    useEffect(() => {
        setCurrentPath(window.location.pathname);
    });


    return (
        <div className="nav flex-row justify-between">
            <Link href={"/"} className="image-text_3 flex-col justify-between align-center">
                <img
                    className="label_3"
                    src={currentPath === "/" ? "/images/nav_earn_act.png" : "/images/nav_earn.png"}
                />
                <span className="text-group_3" style={currentPath === "/" ? { color: "#fff" } : {}}>EARN</span>
            </Link>
            <Link href={"/task"} className="image-text_3 flex-col justify-between align-center">
                <img
                    className="label_3"
                    src={currentPath === "/task" ? "/images/nav_task_act.png" : "/images/nav_task.png"}
                />
                <span className="text-group_3" style={currentPath === "/task" ? { color: "#fff" } : {}}>TASK</span>
            </Link>
            <Link href={"/invite"} className="image-text_3 flex-col justify-between align-center">
                <img
                    className="label_3"
                    src={currentPath === "/invite" ? "/images/nav_invite_act.png" : "/images/nav_invite.png"}
                />
                <span className="text-group_3" style={currentPath === "/invite" ? { color: "#fff" } : {}}>INVITE</span>
            </Link>
            <Link href={"/leader"} className="image-text_3 flex-col justify-between align-center">
                <img
                    className="label_3"
                    src={currentPath === "/leader" ? "/images/nav_leader_act.png" : "/images/nav_leader.png"}
                />
                <span className="text-group_3" style={currentPath === "/leader" ? { color: "#fff" } : {}}>LEADER</span>
            </Link>
            <Link href={"/avatar"} className="image-text_3 flex-col justify-between align-center">
                <img
                    className="label_3"
                    src={currentPath === "/avatar" ? "/images/Avatar_icon.png" : "/images/nav_avatar.png"}
                />
                <span className="text-group_3" style={currentPath === "/avatar" ? { color: "#fff" } : {}}>AVATAR</span>
            </Link>
        </div>
    )
}