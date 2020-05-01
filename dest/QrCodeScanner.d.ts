/**
 * Created by jcika on 11.02.2020.
 **/
import * as React from "react";
declare enum QrCodeScannerState {
    Init = 0,
    Running = 1,
    Closed = 2,
    Error = 3
}
interface CmpState {
    state: QrCodeScannerState;
    cameras: MediaDeviceInfo[];
    selectedCameraId?: string;
    width?: number;
    height?: number;
}
interface CmpProps {
    onQrCodeData?: (data: string) => void;
    width?: number;
}
declare class QrCodeScanner extends React.Component<CmpProps, CmpState> {
    private video?;
    private renderingContext?;
    private stream?;
    constructor(props: CmpProps, context: any);
    private closeOpenStream;
    private loadCamera;
    private draw;
    private handleStreamEvent;
    private initVideo;
    private initCanvas;
    componentWillUnmount(): void;
    private renderCameraList;
    render(): JSX.Element;
}
export default QrCodeScanner;
