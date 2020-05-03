/**
 * Created by jcika on 11.02.2020.
 **/
import * as React from "react";
import jsQR from "jsqr";


interface CmpState {
    error?: string;
}

interface CmpProps {
    mediaStream: MediaStream;
    onQrCodeData?: (data: string) => void;
}


class VideoElement extends React.Component<CmpProps, CmpState> {
    private video?: HTMLVideoElement;
    private renderingContext?: CanvasRenderingContext2D;
    private timeout?: number;


    constructor(props: CmpProps, context: any) {
        super(props, context);

        this.state = {}
        this.draw = this.draw.bind(this);
    }


    componentDidMount() {
        const {mediaStream} = this.props;

        const {video} = this;
        if (!video) {
            return;
        }
        video.srcObject = mediaStream;
        // video.addEventListener('play', this.draw, false);

        video.play()
            .then(() => {
                console.log("Open success");
                this.timeout = setInterval(this.draw, 150);
            })
            .catch(err => console.log(err));
    }

    componentWillUnmount(): void {
        this.timeout && clearTimeout(this.timeout);
        this.closeOpenStream();
    }

    private closeOpenStream() {
        const {video} = this;
        if (video) {
            console.log("Closing stream");
            // video.removeEventListener('play', this.draw);
            video.srcObject = null;
        }
    }

    private setError(key: string, message: string) {
        this.setState({error: message});
    }

    private draw() {
        const {video, renderingContext} = this;
        if (!video || !renderingContext) {
            return;
        }

        const {onQrCodeData} = this.props;

        if (video.paused || video.ended) {
            return false;
        }

        // console.log("W: "+, "H: "+ );


        const videoWidth = video.videoWidth;
        const videoHeight= video.videoHeight;
        if (!videoWidth || !videoHeight) {
            return;
        }

        const ratio = videoHeight/videoWidth;

        const width = renderingContext.canvas.width
        const hRatio = width * ratio;



        renderingContext.drawImage(video, 0, 0, width, hRatio);

        const imageData = renderingContext.getImageData(0, 0, width, hRatio);
        const code = jsQR(imageData.data, imageData.width, imageData.height);


        if (code) {
            this.closeOpenStream();

            if (onQrCodeData) {
                onQrCodeData(code.data);
            }
        }
    };


    private initVideo(node: HTMLVideoElement) {
        this.video = node;
    }

    private initCanvas(node: HTMLCanvasElement) {
        if (!node) {
            return;
        }
        const context = node.getContext("2d");
        this.renderingContext = (context ? context : undefined)
    }


    render() {
        const {error} = this.state;

        const rendererCameraNotAllowed = () => {
            return (
                <div style={{width: "inherit", height: "100%", display: "flex"}}>
                    <svg viewBox="0 0 640 512" style={{width: "128px", marginLeft: "auto", marginRight: "auto"}}>
                        <path fill="currentColor"
                              d="M633.8 458.1l-55-42.5c15.4-1.4 29.2-13.7 29.2-31.1v-257c0-25.5-29.1-40.4-50.4-25.8L448 177.3v137.2l-32-24.7v-178c0-26.4-21.4-47.8-47.8-47.8H123.9L45.5 3.4C38.5-2 28.5-.8 23 6.2L3.4 31.4c-5.4 7-4.2 17 2.8 22.4L42.7 82 416 370.6l178.5 138c7 5.4 17 4.2 22.5-2.8l19.6-25.3c5.5-6.9 4.2-17-2.8-22.4zM32 400.2c0 26.4 21.4 47.8 47.8 47.8h288.4c11.2 0 21.4-4 29.6-10.5L32 154.7v245.5z"/>
                    </svg>
                </div>
            )
        }

        return (
            <div className="my-2">
                <video hidden={true} ref={this.initVideo.bind(this)}/>
                <canvas style={{width: "100%", height: "auto"}}
                        ref={this.initCanvas.bind(this)}/>
                {error && <p>error</p>}
            </div>
        );
    }
}


export default VideoElement;