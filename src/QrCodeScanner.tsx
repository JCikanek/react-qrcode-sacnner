/**
 * Created by jcika on 11.02.2020.
 **/
import * as React from "react";
import jsQR from "jsqr";

enum QrCodeScannerState {
    Init,
    Running,
    Closed,
    Error
}

interface CmpState {
    state: QrCodeScannerState
    cameras: MediaDeviceInfo[]
}

interface CmpProps {
    onQrCodeData?: (data: string) => void;
}

const width = 350;
const height = Math.floor(width * (4 / 5));

class QrCodeScanner extends React.Component<CmpProps, CmpState> {
    private video?: HTMLVideoElement;
    private renderingContext?: CanvasRenderingContext2D;
    private stream?: MediaStream;

    constructor(props: CmpProps, context: any) {
        super(props, context);

        this.state = {state: QrCodeScannerState.Init, cameras: []}

        const readDevices = (devices: MediaDeviceInfo[]) => {
            const result = devices.filter(it => it.kind === "videoinput");
            this.setState({...this.state, cameras: result});
        };
        navigator.mediaDevices.enumerateDevices().then(readDevices.bind(this));
    }

    private closeOpenStream() {
        if (this.stream) {
            this.stream.getTracks().forEach(it => it.stop());
        }
        this.stream = undefined;
    }

    private loadCamera(id: string) {
        this.closeOpenStream();
        if (!id) {
            return
        }

        const onCameraLoaded = (stream: MediaStream) => {
            const video = this.video;
            if (!video) {
                return;
            }

            this.stream = stream;
            video.srcObject = stream;

            video.addEventListener('play', this.handleStreamEvent.bind(this), false);
            return video.play()
        };

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({video: {deviceId: id}})
                .then(onCameraLoaded.bind(this))
                .then(() => {
                    const st = {...this.state, state: QrCodeScannerState.Running}
                    this.setState(st);
                })
                .catch(err => console.error(err));
        }

    }

    private draw(video: HTMLVideoElement, context2D: CanvasRenderingContext2D, w: number, h: number) {
        const {onQrCodeData} = this.props;

        if (video.paused || video.ended) return false;

        context2D.drawImage(video, 0, 0, w, h);

        const imageData = context2D.getImageData(0, 0, w, h);
        const code = jsQR(imageData.data, imageData.width, imageData.height);


        const timeout = setTimeout(this.draw.bind(this), 150, video, context2D, w, h);

        if (code) {
            this.closeOpenStream();
            clearTimeout(timeout);
            this.setState({...this.state, state: QrCodeScannerState.Closed});
            if (onQrCodeData) {
                onQrCodeData(code.data);
            }
        }
    };

    private handleStreamEvent() {
        const video = this.video;
        const context = this.renderingContext;
        if (!video || !context) {
            return;
        }
        this.draw(video, context, width, height);
    }

    private initVideo(node: HTMLVideoElement) {
        if (!node) {
            return;
        }
        this.video = node;
    }

    private initCanvas(node: HTMLCanvasElement) {
        if (!node) {
            return;
        }

        const context = node.getContext("2d");
        if (context === null) {
            return;
        }
        this.renderingContext = context;
    }

    componentWillUnmount(): void {
        this.closeOpenStream();
    }

    private renderCameraList() {
        const cameras = this.state.cameras
            .map((it, index) =>
                <option key={"item-" + index} value={it.deviceId}>{it.label}</option>);

        return (
            <select className="w-100" onChange={(e) => this.loadCamera(e.target.value)}>
                <option/>
                {cameras}
            </select>
        )
    }

    render() {
        const {state} = this.state
        const cameraBoxStyle = {
            width: width + "px",
            height: height + "px",
            marginLeft: "auto",
            marginRight: "auto"
        }

        const capture = (
            <div style={cameraBoxStyle} className="my-2">
                <video width={width + "px"} height={height + "px"} hidden={true} ref={this.initVideo.bind(this)}/>
                <canvas width={width + "px"} height={height + "px"} ref={this.initCanvas.bind(this)}/>
            </div>)


        return (
            <div>
                {this.renderCameraList()}
                {capture}
            </div>
        );
    }
}


export default QrCodeScanner;