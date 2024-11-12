"use client";

import '../styles/pointesRecord.scss'
import { useRouter } from 'next/navigation';

export default function PointsRecord() {
    const router = useRouter();
    return (
        <div className="pointsRecord flex-col">
            <div className="box_1 flex-row">
                <div className="image-text_1 flex-col justify-between">
                    <img
                        onClick={() => router.back()}
                        className="label_1"
                        src={"https://lanhu-oss.lanhuapp.com/FigmaDDSSlicePNG6d6c8d24c772d2f9bdce76ae48fa9188.png"}
                    />
                    <span className="text-group_1">Points Record</span>
                </div>
            </div>
            <div className="box_2 flex-row justify-between">
                <div className="image-text_2 flex-row justify-between">
                    <img
                        className="image_1"
                        src={"https://lanhu-oss.lanhuapp.com/FigmaDDSSlicePNG0d0603aa65afbdc24a41aa5ab7bcd2b2.png"}
                    />
                    <div className="text-group_2 flex-col justify-between">
                        <span className="text_1">2024/04/16 05:00</span>
                        <span className="text_2">Trial2Earn</span>
                    </div>
                </div>
                <span className="text_3">+550</span>
            </div>

            <div className="box_2 flex-row justify-between">
                <div className="image-text_2 flex-row justify-between">
                    <img
                        className="image_1"
                        src={"https://lanhu-oss.lanhuapp.com/FigmaDDSSlicePNGf336c53fa613dfc1576d8f0bfcf6a61d.png"}
                    />
                    <div className="text-group_2 flex-col justify-between">
                        <span className="text_1">2024/04/16 05:00</span>
                        <span className="text_2">Trial2Earn</span>
                    </div>
                </div>
                <span className="text_3 red_text">-8,000</span>
            </div>
        </div>
    )
}