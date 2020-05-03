var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/**
 * Created by jcika on 11.02.2020.
 **/
import * as React from "react";
import VideoElement from "./VideoElement";
var QrCodeScannerState;
(function (QrCodeScannerState) {
    QrCodeScannerState[QrCodeScannerState["Init"] = 0] = "Init";
    QrCodeScannerState[QrCodeScannerState["Running"] = 1] = "Running";
    QrCodeScannerState[QrCodeScannerState["Closed"] = 2] = "Closed";
    QrCodeScannerState[QrCodeScannerState["Error"] = 3] = "Error";
})(QrCodeScannerState || (QrCodeScannerState = {}));
var QrCodeScanner = /** @class */ (function (_super) {
    __extends(QrCodeScanner, _super);
    function QrCodeScanner(props, context) {
        var _this = _super.call(this, props, context) || this;
        _this.state = {
            cameras: []
        };
        return _this;
    }
    QrCodeScanner.prototype.componentDidMount = function () {
        var _this = this;
        var readDevices = function (devices) {
            console.log(devices);
            var result = devices.filter(function (it) { return it.deviceId !== "" && it.kind === "videoinput"; });
            var newState = {
                cameras: result,
                selectedCameraId: result[0].deviceId,
                stream: _this.state.stream
            };
            // this.setState({cameras: this.state.cameras, selectedCameraId: arg.id});
            _this.setState(newState);
        };
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            this.setError("MediaInit", "Initialize media device failed");
        }
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (arg) {
            console.log(arg);
            _this.setState({
                cameras: [],
                selectedCameraId: undefined,
                stream: arg
            });
            return navigator.mediaDevices.enumerateDevices();
        })
            .then(function (arg) {
            console.log(arg);
            readDevices(arg);
        })
            .catch(function (err) {
            _this.setError("UserMedia", err);
        });
    };
    QrCodeScanner.prototype.setError = function (key, message) {
        console.log("Key: " + key, "Message: " + message);
        this.setState({ cameras: this.state.cameras, error: { key: key, message: message } });
    };
    QrCodeScanner.prototype.componentWillUnmount = function () {
        var stream = this.state.stream;
        stream && this.closeActualStream(stream);
    };
    QrCodeScanner.prototype.closeActualStream = function (mediaStream) {
        if (mediaStream) {
            console.log("Closing stream");
            mediaStream.getTracks().forEach(function (it) {
                console.log("Close track", it);
                it.stop();
            });
        }
    };
    QrCodeScanner.prototype.openStreamByCameraId = function (cameraId) {
        var _this = this;
        var stream = this.state.stream;
        console.log("Open stream by camera ID", cameraId);
        var handleCameraOpen = function (mediaStream) {
            console.log("Stream opened ", mediaStream);
            _this.setState({
                cameras: _this.state.cameras,
                selectedCameraId: cameraId,
                stream: mediaStream
            });
        };
        stream && this.closeActualStream(stream);
        navigator.mediaDevices.getUserMedia({ video: { deviceId: cameraId } })
            .then(function (stream) { return handleCameraOpen(stream); })
            .catch(function (err) {
            _this.setError("loadCamera", err);
        });
    };
    QrCodeScanner.prototype.renderCameraList = function () {
        var _this = this;
        var _a = this.state, cameras = _a.cameras, selectedCameraId = _a.selectedCameraId;
        var options = cameras.map(function (it, index) {
            return React.createElement("option", { key: it.deviceId, value: it.deviceId }, it.label);
        });
        return (React.createElement("select", { className: "w-100", value: selectedCameraId, onChange: function (e) {
                _this.openStreamByCameraId(e.target.value);
            } }, options));
    };
    QrCodeScanner.prototype.render = function () {
        var _this = this;
        var _a = this.state, selectedCameraId = _a.selectedCameraId, stream = _a.stream;
        var onQrCodeData = this.props.onQrCodeData;
        var capture = function () {
            return (React.createElement("div", null,
                selectedCameraId && _this.renderCameraList(),
                stream && React.createElement(VideoElement, { key: stream.id, mediaStream: stream, onQrCodeData: onQrCodeData })));
        };
        var rendererCameraNotAllowed = function () {
            return (React.createElement("div", { style: { width: "inherit", height: "100%", display: "flex" } },
                React.createElement("svg", { viewBox: "0 0 640 512", style: { width: "128px", marginLeft: "auto", marginRight: "auto" } },
                    React.createElement("path", { fill: "currentColor", d: "M633.8 458.1l-55-42.5c15.4-1.4 29.2-13.7 29.2-31.1v-257c0-25.5-29.1-40.4-50.4-25.8L448 177.3v137.2l-32-24.7v-178c0-26.4-21.4-47.8-47.8-47.8H123.9L45.5 3.4C38.5-2 28.5-.8 23 6.2L3.4 31.4c-5.4 7-4.2 17 2.8 22.4L42.7 82 416 370.6l178.5 138c7 5.4 17 4.2 22.5-2.8l19.6-25.3c5.5-6.9 4.2-17-2.8-22.4zM32 400.2c0 26.4 21.4 47.8 47.8 47.8h288.4c11.2 0 21.4-4 29.6-10.5L32 154.7v245.5z" }))));
        };
        var rendererCameraSuccess = function (cameraId) {
            return cameraId ? capture() : rendererCameraNotAllowed();
        };
        var rendererCameraError = function (error) {
            return (React.createElement("div", null, error.message));
        };
        return (React.createElement(React.Fragment, null, rendererCameraSuccess(selectedCameraId)));
    };
    return QrCodeScanner;
}(React.Component));
export default QrCodeScanner;
