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
    selectedCameraId?: string;
    width?: number;
    height?: number;
}

interface CmpProps {
    onQrCodeData?: (data: string) => void;
    width?: number;
}


class QrCodeScanner extends React.Component<CmpProps, CmpState> {
    private video?: HTMLVideoElement;
    private renderingContext?: CanvasRenderingContext2D;
    private stream?: MediaStream;


    constructor(props: CmpProps, context: any) {
        super(props, context);
        const {width} = this.props;
        const height = width && Math.floor(width * (4 / 5));

        this.state = {
            state: QrCodeScannerState.Init,
            cameras: [],
            width,
            height
        }


        const readDevices = (devices: MediaDeviceInfo[]) => {
            const result = devices.filter(it => it.kind === "videoinput");
            console.log(result);
            this.setState({...this.state, cameras: result});
        };

        navigator.mediaDevices.getUserMedia({video: true})
            .then(arg => {

                this.loadCamera(arg.id);
                navigator.mediaDevices.enumerateDevices().then(readDevices.bind(this));
            })
            .catch(err => console.log(err))


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
        this.setState({...this.state, selectedCameraId: id});

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

    private draw(video: HTMLVideoElement, context2D: CanvasRenderingContext2D) {
        const {onQrCodeData} = this.props;

        if (video.paused || video.ended) return false;

        const w = context2D.canvas.width;
        const h = context2D.canvas.height;

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
        this.draw(video, context);
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
        const {cameras, selectedCameraId} = this.state
        const options = cameras.map((it, index) =>
            <option key={it.deviceId} value={it.deviceId}>{it.label}</option>);

        return (
            selectedCameraId &&
            <select className="w-100"
                    value={selectedCameraId}
                    onChange={(e) => this.loadCamera(e.target.value)}>
                {options}
            </select>
        )
    }

    render() {
        const {selectedCameraId} = this.state
        const cameraBoxStyle = {
            marginLeft: "auto",
            marginRight: "auto"
        }

        const capture = (
            <div>
                {this.renderCameraList()}
                <div style={cameraBoxStyle} className="my-2">
                    <video hidden={true} ref={this.initVideo.bind(this)}/>
                    <canvas style={{width: "100%", height: "auto"}} ref={this.initCanvas.bind(this)}/>
                </div>
            </div>)

        const rendererCameraError = (
            <div style={{width: "inherit", height: "100%", display: "flex"}}>
                <svg viewBox="0 0 640 512" style={{width: "128px", marginLeft: "auto", marginRight: "auto"}}>
                    <path fill="currentColor"
                          d="M633.8 458.1l-55-42.5c15.4-1.4 29.2-13.7 29.2-31.1v-257c0-25.5-29.1-40.4-50.4-25.8L448 177.3v137.2l-32-24.7v-178c0-26.4-21.4-47.8-47.8-47.8H123.9L45.5 3.4C38.5-2 28.5-.8 23 6.2L3.4 31.4c-5.4 7-4.2 17 2.8 22.4L42.7 82 416 370.6l178.5 138c7 5.4 17 4.2 22.5-2.8l19.6-25.3c5.5-6.9 4.2-17-2.8-22.4zM32 400.2c0 26.4 21.4 47.8 47.8 47.8h288.4c11.2 0 21.4-4 29.6-10.5L32 154.7v245.5z"/>
                </svg>
            </div>
        )

        return (
            <>
                {!selectedCameraId && rendererCameraError}
                {selectedCameraId && capture}
            </>
        );
    }
}


export default QrCodeScanner;