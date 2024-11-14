import '../styles/tipModel.scss'
import { useState } from 'react'

export default function TipModel({ children, closeFunc, loacl_show_again, isShowCheckAgain, showAgainFunc }) {
    const [showAgain, setShowAgain] = useState(loacl_show_again)
    const handleCheckShowAgain = () => {
        setShowAgain(!showAgain)
        showAgainFunc && showAgainFunc(!showAgain)
    }
    return (
        <div className="tipModel flex-col">
            <div className="image-wrapper_1 flex-col">
                <img
                    className="image_1"
                    src={"/images/FigmaDDSSlicePNG0e497c8e12d106821f46d93a1afb0ed8.png"}
                />
            </div>
            <div className="box_1 flex-col">
                <div className="image-wrapper_2 flex-row">
                    <img
                        className="label_1"
                        src={"/images/close.png"}
                        onClick={closeFunc}
                    />
                </div>
                {children}
            </div>
            {isShowCheckAgain && <div className="box_3 flex-col">
                <div className="group_1 flex-row justify-between" onClick={handleCheckShowAgain}>
                    <div className="box_4 flex-col">
                        {showAgain && <div className="block_1 flex-col" />}
                    </div>
                    <span className="text_3">Do not show again</span>
                </div>
            </div>}
        </div>
    )
}