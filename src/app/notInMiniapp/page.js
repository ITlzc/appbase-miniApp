"use client";
import '../styles/errorTip.scss'

export default function ErrorTip() {

    return (
        <div className="errortip flex-col">
            <div className="group_1 flex-row justify-between">
                <span className="text_1">The current environment is not telegram mini app,this app can only run in telegram mini app. </span>
            </div>
        </div>
    )
}