/**
 * Created by jcika on 11.02.2020.
 **/
import * as React from "react";
declare type CameraError = {
    key: string;
    message: string;
};
interface CmpState {
    cameras: MediaDeviceInfo[];
    selectedCameraId?: string;
    stream?: MediaStream;
    error?: CameraError;
}
interface CmpProps {
    onQrCodeData?: (data: string) => void;
}
declare class QrCodeScanner extends React.Component<CmpProps, CmpState> {
    constructor(props: CmpProps, context: any);
    componentDidMount(): void;
    private setError;
    componentWillUnmount(): void;
    closeActualStream(mediaStream: MediaStream): void;
    private openStreamByCameraId;
    private renderCameraList;
    render(): JSX.Element;
}
export default QrCodeScanner;
