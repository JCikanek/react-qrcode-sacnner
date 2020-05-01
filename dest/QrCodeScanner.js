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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
/**
 * Created by jcika on 11.02.2020.
 **/
import * as React from "react";
import jsQR from "jsqr";
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
        var width = _this.props.width;
        var height = width && Math.floor(width * (4 / 5));
        _this.state = {
            state: QrCodeScannerState.Init,
            cameras: [],
            width: width,
            height: height
        };
        var readDevices = function (devices) {
            var result = devices.filter(function (it) { return it.kind === "videoinput"; });
            console.log(result);
            _this.setState(__assign(__assign({}, _this.state), { cameras: result }));
        };
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (arg) {
            _this.loadCamera(arg.id);
            navigator.mediaDevices.enumerateDevices().then(readDevices.bind(_this));
        })
            .catch(function (err) { return console.log(err); });
        return _this;
    }
    QrCodeScanner.prototype.closeOpenStream = function () {
        if (this.stream) {
            this.stream.getTracks().forEach(function (it) { return it.stop(); });
        }
        this.stream = undefined;
    };
    QrCodeScanner.prototype.loadCamera = function (id) {
        var _this = this;
        this.closeOpenStream();
        if (!id) {
            return;
        }
        this.setState(__assign(__assign({}, this.state), { selectedCameraId: id }));
        var onCameraLoaded = function (stream) {
            var video = _this.video;
            if (!video) {
                return;
            }
            _this.stream = stream;
            video.srcObject = stream;
            video.addEventListener('play', _this.handleStreamEvent.bind(_this), false);
            return video.play();
        };
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: { deviceId: id } })
                .then(onCameraLoaded.bind(this))
                .then(function () {
                var st = __assign(__assign({}, _this.state), { state: QrCodeScannerState.Running });
                _this.setState(st);
            })
                .catch(function (err) { return console.error(err); });
        }
    };
    QrCodeScanner.prototype.draw = function (video, context2D) {
        var onQrCodeData = this.props.onQrCodeData;
        if (video.paused || video.ended)
            return false;
        var w = context2D.canvas.width;
        var h = context2D.canvas.height;
        context2D.drawImage(video, 0, 0, w, h);
        var imageData = context2D.getImageData(0, 0, w, h);
        var code = jsQR(imageData.data, imageData.width, imageData.height);
        var timeout = setTimeout(this.draw.bind(this), 150, video, context2D, w, h);
        if (code) {
            this.closeOpenStream();
            clearTimeout(timeout);
            this.setState(__assign(__assign({}, this.state), { state: QrCodeScannerState.Closed }));
            if (onQrCodeData) {
                onQrCodeData(code.data);
            }
        }
    };
    ;
    QrCodeScanner.prototype.handleStreamEvent = function () {
        var video = this.video;
        var context = this.renderingContext;
        if (!video || !context) {
            return;
        }
        this.draw(video, context);
    };
    QrCodeScanner.prototype.initVideo = function (node) {
        if (!node) {
            return;
        }
        this.video = node;
    };
    QrCodeScanner.prototype.initCanvas = function (node) {
        if (!node) {
            return;
        }
        var context = node.getContext("2d");
        if (context === null) {
            return;
        }
        this.renderingContext = context;
    };
    QrCodeScanner.prototype.componentWillUnmount = function () {
        this.closeOpenStream();
    };
    QrCodeScanner.prototype.renderCameraList = function () {
        var _this = this;
        var _a = this.state, cameras = _a.cameras, selectedCameraId = _a.selectedCameraId;
        var options = cameras.map(function (it, index) {
            return React.createElement("option", { key: it.deviceId, value: it.deviceId }, it.label);
        });
        return (selectedCameraId &&
            React.createElement("select", { className: "w-100", value: selectedCameraId, onChange: function (e) { return _this.loadCamera(e.target.value); } }, options));
    };
    QrCodeScanner.prototype.render = function () {
        var selectedCameraId = this.state.selectedCameraId;
        var cameraBoxStyle = {
            marginLeft: "auto",
            marginRight: "auto"
        };
        var capture = (React.createElement("div", null,
            this.renderCameraList(),
            React.createElement("div", { style: cameraBoxStyle, className: "my-2" },
                React.createElement("video", { hidden: true, ref: this.initVideo.bind(this) }),
                React.createElement("canvas", { style: { width: "100%", height: "auto" }, ref: this.initCanvas.bind(this) }))));
        var rendererCameraError = (React.createElement("div", { style: { width: "inherit", height: "100%", display: "flex" } },
            React.createElement("svg", { viewBox: "0 0 640 512", style: { width: "128px", marginLeft: "auto", marginRight: "auto" } },
                React.createElement("path", { fill: "currentColor", d: "M633.8 458.1l-55-42.5c15.4-1.4 29.2-13.7 29.2-31.1v-257c0-25.5-29.1-40.4-50.4-25.8L448 177.3v137.2l-32-24.7v-178c0-26.4-21.4-47.8-47.8-47.8H123.9L45.5 3.4C38.5-2 28.5-.8 23 6.2L3.4 31.4c-5.4 7-4.2 17 2.8 22.4L42.7 82 416 370.6l178.5 138c7 5.4 17 4.2 22.5-2.8l19.6-25.3c5.5-6.9 4.2-17-2.8-22.4zM32 400.2c0 26.4 21.4 47.8 47.8 47.8h288.4c11.2 0 21.4-4 29.6-10.5L32 154.7v245.5z" }))));
        return (React.createElement(React.Fragment, null,
            !selectedCameraId && rendererCameraError,
            selectedCameraId && capture));
    };
    return QrCodeScanner;
}(React.Component));
export default QrCodeScanner;
