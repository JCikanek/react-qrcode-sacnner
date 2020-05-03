/**
 * Created by jcika on 11.02.2020.
 **/
import * as React from "react";
import jsQR from "jsqr";
import VideoElement from "./VideoElement";

enum QrCodeScannerState {
    Init,
    Running,
    Closed,
    Error
}

type CameraError = {
    key: string
    message: string;
}

interface CmpState {
    cameras: MediaDeviceInfo[]
    selectedCameraId?: string;
    stream?: MediaStream
    error?: CameraError

}

interface CmpProps {
    onQrCodeData?: (data: string) => void;
}


class QrCodeScanner extends React.Component<CmpProps, CmpState> {

    constructor(props: CmpProps, context: any) {
        super(props, context);

        this.state = {
            cameras: []
        }

    }


    componentDidMount() {
        const readDevices = (devices: MediaDeviceInfo[]) => {
            console.log(devices)
            const result = devices.filter(it => it.deviceId !== "" && it.kind === "videoinput");

            const newState = {
                cameras: result,
                selectedCameraId: result[0].deviceId,
                stream: this.state.stream
            }
            // this.setState({cameras: this.state.cameras, selectedCameraId: arg.id});
            this.setState(newState);
        };

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            this.setError("MediaInit", "Initialize media device failed")
        }


        navigator.mediaDevices.getUserMedia({video: true})
            .then(arg => {
                console.log(arg);
                this.setState({
                    cameras: [],
                    selectedCameraId: undefined,
                    stream: arg
                });
                return navigator.mediaDevices.enumerateDevices()
            })
            .then(arg => {
                console.log(arg);
                readDevices(arg);
            })
            .catch(err => {
                this.setError("UserMedia", err)
            })
    }


    private setError(key: string, message: string) {
        console.log("Key: " + key, "Message: " + message);
        this.setState({cameras: this.state.cameras, error: {key, message}})
    }

    componentWillUnmount(): void {
        const {stream} = this.state;
        stream && this.closeActualStream(stream);
    }

    closeActualStream(mediaStream: MediaStream) {
        if (mediaStream) {
            console.log("Closing stream");
            mediaStream.getTracks().forEach(it => {
                console.log("Close track", it);
                it.stop()
            });
        }
    }

    private openStreamByCameraId(cameraId: string) {
        const {stream} = this.state;
        console.log("Open stream by camera ID", cameraId);

        const handleCameraOpen = (mediaStream: MediaStream) => {
            console.log("Stream opened ", mediaStream);
            this.setState({
                cameras: this.state.cameras,
                selectedCameraId: cameraId,
                stream: mediaStream
            })
        }

        stream && this.closeActualStream(stream);
        navigator.mediaDevices.getUserMedia({video: {deviceId: cameraId}})
            .then(stream => handleCameraOpen(stream))
            .catch(err => {
                this.setError("loadCamera", err)
            });
    }


    private renderCameraList() {
        const {cameras, selectedCameraId} = this.state
        const options = cameras.map((it, index) =>
            <option key={it.deviceId} value={it.deviceId}>{it.label}</option>);

        return (
            <select className="w-100"
                    value={selectedCameraId}
                    onChange={(e) => {
                        this.openStreamByCameraId(e.target.value)
                    }}>
                {options}
            </select>
        )
    }

    render() {
        const {selectedCameraId, stream} = this.state
        const {onQrCodeData} = this.props

        const capture = () => {
            return (
                <div>
                    {selectedCameraId && this.renderCameraList()}
                    {stream && <VideoElement key={stream.id} mediaStream={stream} onQrCodeData={onQrCodeData}/>}
                </div>)
        }


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

        const rendererCameraSuccess = (cameraId?: string) => {
            return cameraId ? capture() : rendererCameraNotAllowed()
        }


        const rendererCameraError = (error: CameraError) => {
            return (
                <div>
                    {error.message}
                </div>)

        }

        return (
            <>
                {rendererCameraSuccess(selectedCameraId)}
            </>
        );
    }
}


export default QrCodeScanner;