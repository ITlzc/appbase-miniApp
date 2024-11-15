"use client";
import '../styles/errorTip.scss'

export default function ErrorTip() {

    return (
        <div className="page flex-col">
          <div className="image-wrapper_1 flex-col">
            <img
              className="image_1"
              src={"/images/FigmaDDSSlicePNG0e497c8e12d106821f46d93a1afb0ed8.png"}
            />
          </div>
          <img
            className="image_2"
            src={"/images/FigmaDDSSlicePNG3df30b40f8b9461a582c14cbd41849a5.png"}
          />
          <div className="box_1 flex-col">
            <span className="text_1">
              The&nbsp;current&nbsp;environment&nbsp;is&nbsp;not&nbsp;telegram&nbsp;mini&nbsp;app,&nbsp;this&nbsp;app&nbsp;can&nbsp;only&nbsp;run&nbsp;in&nbsp;telegram&nbsp;mini&nbsp;app.
            </span>
            {/* <div className="text-wrapper_1 flex-col">
              <span className="text_2">Back</span>
            </div> */}
          </div>
        </div>
    );
}