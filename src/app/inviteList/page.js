
"use client";
import '../styles/inviteList.scss'
import { useRouter } from 'next/navigation'
export default function InviteList() {
    const router = useRouter()

    return (
        <div className="inviteList flex-col">
            <div className="box_1 flex-row justify-between">
                <div className="image-text_1 flex-col justify-between">
                    <img
                        onClick={() => router.back()}
                        className="label_1"
                        src={"https://lanhu-oss.lanhuapp.com/FigmaDDSSlicePNG6d6c8d24c772d2f9bdce76ae48fa9188.png"}
                    />
                    <span className="text-group_1">Invite Friends</span>
                </div>
                <span className="text_1">25 valid / 32 friend</span>
            </div>
            <div className="list_1 flex-col">
                <div className="list-items_1-0 flex-row">
                    <div className="image-text_2-0 flex-row justify-between">
                        <img
                            className="image_1-0"
                            src={"https://lanhu-oss.lanhuapp.com/FigmaDDSSlicePNGcca9338d66981dbf6ae15ed88c6c5bae.png"}
                        />
                        <span className="text-group_2-0"> Richard</span>
                    </div>
                    <span className="text_3-0">+1000</span>
                </div>
                <div className="list-items_1-1 flex-row">
                    <img
                        className="image_2-1"
                        src={"https://lanhu-oss.lanhuapp.com/FigmaDDSSlicePNG268328afa0a9b358ac725f3a450f5e4d.png"}
                    />
                    <span className="text_2-1">Riley</span>
                    <span className="text_3-1">+1000</span>
                </div>
                <div className="list-items_1-2 flex-row">
                    <img
                        className="image_2-2"
                        src={"https://lanhu-oss.lanhuapp.com/FigmaDDSSlicePNG2369c7b4248624928f0836a2f19761de.png"}
                    />
                    <span className="text_2-2">Theo</span>
                    <span className="text_3-2">0</span>
                </div>
                <div className="list-items_1-3 flex-row">
                    <img
                        className="image_2-3"
                        src={"https://lanhu-oss.lanhuapp.com/FigmaDDSSlicePNG62f9f4a90653c18e4ea576eeab0410b4.png"}
                    />
                    <span className="text_2-3">Luca</span>
                    <span className="text_3-3">+1000</span>
                </div>
                <div className="list-items_1-4 flex-row">
                    <img
                        className="image_2-4"
                        src={"https://lanhu-oss.lanhuapp.com/FigmaDDSSlicePNG8ae0f3eed57235581fa7fa632fa82644.png"}
                    />
                    <span className="text_2-4">James</span>
                    <span className="text_3-4">+1000</span>
                </div>
            </div>
            <div className="box_2 flex-row justify-between">
                <div className="text-wrapper_1 flex-col justify-center align-center">
                    <span className="text_4">Share Link</span>
                </div>
                <div className="text-wrapper_2 flex-col justify-center align-center">
                    <span className="text_5">Invite Friends</span>
                </div>
            </div>
        </div>
    )
}