"use client";

import Nav from "../components/Nav";
import '../styles/avatar.scss'
import { useEffect, useState } from 'react';
import { Popover, Spin } from 'antd';
import TipModel from '@/app/components/TipModel';



export default function Avatar() {
    const [tab_act, setTab_act] = useState('Withdrawal')
    const [open, setOpen] = useState(false);
    const [showModel, setShowModel] = useState(false)
    const [showExchangeModel, setShowExchangeModel] = useState(false)
    const handleOpenChange = (newOpen) => {
        setOpen(newOpen);
    };
    return (
        <div className="avatar flex-col">
            <div className="group_1 flex-col">
                <div className="box_1 flex-row justify-between">
                    <span className="text_1">Personal Center</span>
                    <img
                        className="label_1"
                        src={
                            "https://lanhu-dds-backend.oss-cn-beijing.aliyuncs.com/merge_image/imgs/b5c4183386df4ffba775f33044cc2b45_mergeImage.png"
                        }
                    />
                </div>
                <div className="box_2 flex-row">
                    <img
                        className="image_1"
                        src={"https://lanhu-oss.lanhuapp.com/FigmaDDSSlicePNGcca9338d66981dbf6ae15ed88c6c5bae.png"}
                    />
                    <div className="text-group_1 flex-col justify-between">
                        <span className="text_2">Richard</span>
                        <span className="text_3">330,000 Points</span>
                    </div>
                    <img
                        className="thumbnail_1"
                        src={"https://lanhu-oss.lanhuapp.com/FigmaDDSSlicePNG8dd6c53334585797738a879282015c97.png"}
                    />
                </div>
                <div className="list_1 flex-row justify-between align-between">
                    <div className="text-group_2-0 flex-col">
                        <span className="text_4-0">Trial2Earn Points</span>
                        <span className="text_6-0">20,000</span>
                    </div>

                    <div className="text-group_2-0 flex-col">
                        <span className="text_4-0">Task Points</span>
                        <span className="text_6-0">20,000</span>
                    </div>

                    <div className="text-group_2-0 flex-col">
                        <span className="text_4-0">Invite Points</span>
                        <span className="text_6-0">20,000</span>
                    </div>
                </div>
                <div className="text-wrapper_1 flex-row justify-center align-center">
                    <span className={`text_7 flex-col justify-center align-center ${tab_act === 'Withdrawal' && "tab_act"}`} onClick={() => setTab_act('Withdrawal')}>Withdrawal</span>
                    <span className={`text_7 flex-col justify-center align-center ${tab_act === 'Exchange' && "tab_act"}`} onClick={() => setTab_act('Exchange')}>Exchange</span>
                    <span className={`text_7 flex-col justify-center align-center ${tab_act === 'WaitingForTGE' && "tab_act"}`} onClick={() => setTab_act('WaitingForTGE')}>Waiting for TGE</span>
                </div>
                {tab_act !== 'WaitingForTGE' && <>
                    <div className="text-group_3 flex-col justify-between">
                        <span className="text_10">Withdrawable</span>
                        <span className="text_11">$ 80,687.147</span>
                    </div>
                    <div className="box_5 flex-row justify-between">
                        <div className="text-group_4 flex-col justify-between">
                            <span className="text_12">Trial2Earn Points</span>
                            <span className="text_13">$ 687.124</span>
                        </div>
                        <span className="text_14">Withdrawal Record &gt;&gt;&gt;</span>
                    </div>
                    {tab_act === 'Withdrawal' ? <div className="text-wrapper_2 flex-col justify-center align-center">
                        <span className="text_15">Withdrawal</span>
                    </div> : <div className="exchange-btn flex-row justify-between">
                        <Popover
                            content=
                            {
                                <div>
                                    <p className='cursor-pointer' style={{ width: '38.73vw' }}>{'Binance'}</p>
                                </div>
                            }
                            title=""
                            trigger="click"
                            placement="bottom"
                            open={open}
                            onOpenChange={handleOpenChange}
                        >
                            <div className="text-wrapper_2 selectItem flex-row justify-between align-center">
                                <img className="label_2" src="https://lanhu-oss.lanhuapp.com/FigmaDDSSlicePNG64b18d9256f20e885f9a623dcee95bfc.png" alt="" />
                                <span className="text_15">Binance</span>
                                <img
                                    className="label_3"
                                    src={"https://lanhu-oss.lanhuapp.com/FigmaDDSSlicePNGf9b9529224084221be6322fe8916ec1a.png"}
                                />
                            </div>
                        </Popover>

                        <div className="text-wrapper_2 flex-col justify-center align-center">
                            <span className="text_15">Exchange</span>
                        </div>
                    </div>}
                </>}
            </div>
            {tab_act === 'Withdrawal' ? <div className="group_2 flex-col">
                <div className="image-text_1 flex-col justify-between">
                    <img
                        className="image_2"
                        src={"https://lanhu-oss.lanhuapp.com/FigmaDDSSlicePNGfb967357bfee19e7b6dbf3a3ce112ca3.png"}
                    />
                    <div className="text-group_5 flex-col">
                        <span className="text_16">Becoming a Klickl user, you will get</span>
                        <span className="paragraph_1">
                            Cash Instantly Available • Instant Withdrawal •
                            <br />
                            Og Qualification • Doubled Points • One-time Activation •  Lifetime Availability
                        </span>
                    </div>
                </div>
                <div className="text-wrapper_3 flex-col justify-center align-center">
                    <span className="text_17">50 Tons Apply Immediately</span>
                </div>
            </div> : tab_act === 'Exchange' ? <div className="group_2 flex-col">
                <div className="image-text_1 flex-col justify-between">
                    <div className="flex-row exchange-block">
                        <img
                            className="image_2 exchange_icon"
                            src={"https://lanhu-oss.lanhuapp.com/FigmaDDSSlicePNG5dcdee3b6c57f333f24feb924607dd15.png"}
                        />
                        <span>OG Card</span>
                    </div>
                    <div className="text-group_5 flex-col">
                        <span className="text_16">Apply For An AppBase OG Card To Redeem Trial Currency At Any Time</span>
                        <span className="paragraph_1">
                            Doubled Points • Redeem Points At Any Time
                        </span>
                    </div>
                </div>
                <div className="text-wrapper_3 flex-col justify-center align-center">
                    <span className="text_17">10 Tons Purchase Og Card</span>
                </div>
            </div> : <div className="group_2 flex-col">
                <div className="image-text_1 flex-col justify-between">
                    <div className="flex-row exchange-block">
                        <img
                            className="image_2 exchange_icon"
                            src={"https://lanhu-oss.lanhuapp.com/FigmaDDSSlicePNG5dcdee3b6c57f333f24feb924607dd15.png"}
                        />
                    </div>
                    <div className="text-group_5 flex-col">
                        <span className="coming-soon">Coming Soon...</span>
                    </div>
                </div>
            </div>}
            <div className="group_3 flex-col">
                <span className="text_18">About The Product</span>
                <div className="box_6 flex-row justify-between">
                    <span className="text_19">Privacy</span>
                    <img className="group_4" src="/images/arrow-right.png" alt="" />
                </div>
                <div className="box_6 flex-row justify-between">
                    <span className="text_19">About Us</span>
                    <img className="group_4" src="/images/arrow-right.png" alt="" />
                </div>
                <div className="box_6 flex-row justify-between">
                    <span className="text_19">Contact Us</span>
                    <img className="group_4" src="/images/arrow-right.png" alt="" />
                </div>

                <Nav />
            </div>

            {showModel && <TipModel isShowCheckAgain={false} closeFunc={() => setShowModel(false)}>
                <div className='modelContent flex-col justify-center align-center'>
                    <span className="text_1">Spend 50 tons and withdraw using Klickl</span>

                    <div className="group_2 flex-col ">
                        <div className="image-text_1 flex-col justify-between align-center">
                            <img
                                className="image_2"
                                src={"https://lanhu-oss.lanhuapp.com/FigmaDDSSlicePNGfb967357bfee19e7b6dbf3a3ce112ca3.png"}
                            />
                            <div className="text-group_5 flex-col">
                                <span className="text_16">Becoming a Klickl user, you will get</span>
                                <span className="paragraph_1">
                                    Cash Instantly Available • Instant Withdrawal •
                                    <br />
                                    Og Qualification • Doubled Points • One-time Activation •  Lifetime Availability
                                </span>
                            </div>
                        </div>
                    </div>


                    <div className="section_2 flex-row justify-between">
                        <div className="text-wrapper_1 flex-col justify-center align-center">
                            <span className="text_2">Withdraw using other</span>
                        </div>
                        <div className="text-wrapper_2 flex-col justify-center align-center">
                            <span className="text_3">50ton Apply immediately</span>
                        </div>
                    </div>
                </div>
            </TipModel>}

            {showExchangeModel && <TipModel isShowCheckAgain={false} closeFunc={() => setShowModel(false)}>
                <div className='modelContent flex-col justify-center align-center'>
                    <span className="text_1">Purchase OG card and redeem points at any time</span>

                    <div className="group_2 flex-col">
                        <div className="image-text_1 flex-col justify-between">
                            <div className="flex-row exchange-block justify-center">
                                <img
                                    className="image_2 exchange_icon"
                                    src={"https://lanhu-oss.lanhuapp.com/FigmaDDSSlicePNG5dcdee3b6c57f333f24feb924607dd15.png"}
                                />
                                <span>OG Card</span>
                            </div>
                            <div className="text-group_5 flex-col">
                                <span className="text_16">Apply For An AppBase OG Card To Redeem Trial Currency At Any Time</span>
                                <span className="paragraph_1">
                                    Doubled Points • Redeem Points At Any Time
                                </span>
                            </div>
                        </div>
                    </div>


                    <div className="section_2 flex-row justify-between">
                        <div className="text-wrapper_1 flex-col justify-center align-center">
                            <span className="text_2">Abandon Exchange</span>
                        </div>
                        <div className="text-wrapper_2 flex-col justify-center align-center">
                            <span className="text_3">10 tons purchase OG card</span>
                        </div>
                    </div>
                </div>
            </TipModel>}
        </div>
    )
}