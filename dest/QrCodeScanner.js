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
var width = 350;
var height = Math.floor(width * (4 / 5));
var QrCodeScanner = /** @class */ (function (_super) {
    __extends(QrCodeScanner, _super);
    function QrCodeScanner(props, context) {
        var _this = _super.call(this, props, context) || this;
        _this.state = { state: QrCodeScannerState.Init, cameras: [] };
        var readDevices = function (devices) {
            var result = devices.filter(function (it) { return it.kind === "videoinput"; });
            _this.setState(__assign(__assign({}, _this.state), { cameras: result }));
        };
        navigator.mediaDevices.enumerateDevices().then(readDevices.bind(_this));
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
    QrCodeScanner.prototype.draw = function (video, context2D, w, h) {
        var onQrCodeData = this.props.onQrCodeData;
        if (video.paused || video.ended)
            return false;
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
        this.draw(video, context, width, height);
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
        var cameras = this.state.cameras
            .map(function (it, index) {
            return React.createElement("option", { key: "item-" + index, value: it.deviceId }, it.label);
        });
        return (React.createElement("select", { className: "w-100", onChange: function (e) { return _this.loadCamera(e.target.value); } },
            React.createElement("option", null),
            cameras));
    };
    QrCodeScanner.prototype.render = function () {
        var state = this.state.state;
        var cameraBoxStyle = {
            width: width + "px",
            height: height + "px",
            marginLeft: "auto",
            marginRight: "auto"
        };
        var capture = (React.createElement("div", { style: cameraBoxStyle, className: "my-2" },
            React.createElement("video", { width: width + "px", height: height + "px", hidden: true, ref: this.initVideo.bind(this) }),
            React.createElement("canvas", { width: width + "px", height: height + "px", ref: this.initCanvas.bind(this) })));
        return (React.createElement("div", null,
            this.renderCameraList(),
            capture));
    };
    return QrCodeScanner;
}(React.Component));
export default QrCodeScanner;
