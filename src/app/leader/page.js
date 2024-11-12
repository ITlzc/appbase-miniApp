import Nav from "../components/Nav"
import '../styles/leader.scss'

export default function Leader() {
    return (
        <div className="leader flex-col">
            <div className="group_1 flex-row justify-between">
                <span className="text_1">Leaderboard</span>
                <img
                    className="label_1"
                    src={
                        "https://lanhu-dds-backend.oss-cn-beijing.aliyuncs.com/merge_image/imgs/2ff26af4bb1e464099016487f9573f73_mergeImage.png"
                    }
                />
            </div>
            <span className="text_2">My Ranking</span>
            <div className="group_2 flex-row justify-between">
                <div className="flex-row">
                    <span className="text_3">#966</span>
                    <img
                        className="image_1"
                        src={"https://lanhu-oss.lanhuapp.com/FigmaDDSSlicePNGcca9338d66981dbf6ae15ed88c6c5bae.png"}
                    />
                    <span className="text_4"> Richard</span>
                </div>

                <span className="text_5">249</span>
            </div>
            <div className="text-wrapper_1 flex-row justify-between">
                <span className="text_6">TOP 100</span>
                <span className="text_7">8,881,530,000 Holders</span>
            </div>
            <div className="list_1 flex-col">
                <div className="list-items_1-0 flex-row justify-between">
                    <div className="flex-row">
                        <img
                            className="label_2-0"
                            src={"https://lanhu-oss.lanhuapp.com/FigmaDDSSlicePNG99b3bb57363533a416a7cc09f8c6490e.png"}
                        />
                        <img
                            className="image_2-0"
                            src={"https://lanhu-oss.lanhuapp.com/FigmaDDSSlicePNG268328afa0a9b358ac725f3a450f5e4d.png"}
                        />
                        <span className="text_9-0">Riley</span>
                    </div>

                    <span className="text_10-0">88,987,128</span>
                </div>

                <div className="list-items_1-0 flex-row justify-between">
                    <div className="flex-row">
                        <img
                            className="label_2-0"
                            src={"https://lanhu-oss.lanhuapp.com/FigmaDDSSlicePNG5c03c631c93830eac5fe5ef349b3c5cc.png"}
                        />
                        <img
                            className="image_2-0"
                            src={"https://lanhu-oss.lanhuapp.com/FigmaDDSSlicePNG2369c7b4248624928f0836a2f19761de.png"}
                        />
                        <span className="text_9-0">Theo</span>
                    </div>

                    <span className="text_10-0">71,231,232</span>
                </div>

                <div className="list-items_1-0 flex-row justify-between">
                    <div className="flex-row">
                        <img
                            className="label_2-0"
                            src={"https://lanhu-oss.lanhuapp.com/FigmaDDSSlicePNGca28ff8ca2da02e2dc22302c80665fcb.png"}
                        />
                        <img
                            className="image_2-0"
                            src={"https://lanhu-oss.lanhuapp.com/FigmaDDSSlicePNG62f9f4a90653c18e4ea576eeab0410b4.png"}
                        />
                        <span className="text_9-0">Luca</span>
                    </div>

                    <span className="text_10-0">71,231,232</span>
                </div>

                <div className="list-items_1-0 flex-row justify-between">
                    <div className="flex-row">
                        <span className="text_8-3">#4</span>
                        <img
                            className="image_2-0"
                            src={"https://lanhu-oss.lanhuapp.com/FigmaDDSSlicePNG8ae0f3eed57235581fa7fa632fa82644.png"}
                        />
                        <span className="text_9-0">James</span>
                    </div>

                    <span className="text_10-0">4,123,345</span>
                </div>
            </div>
            <Nav />
        </div>
    )
}