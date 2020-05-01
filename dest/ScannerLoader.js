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
var LoadingState;
(function (LoadingState) {
    LoadingState[LoadingState["NotLoaded"] = 0] = "NotLoaded";
    LoadingState[LoadingState["Loading"] = 1] = "Loading";
    LoadingState[LoadingState["Done"] = 2] = "Done";
})(LoadingState || (LoadingState = {}));
var canUseDOM = !!(typeof window !== 'undefined' &&
    window.document &&
    window.document.createElement);
var ScannerLoader = function (Component) {
    var ContainerCmp = /** @class */ (function (_super) {
        __extends(ContainerCmp, _super);
        function ContainerCmp(props, context) {
            var _this = _super.call(this, props, context) || this;
            var isSMapDefined = typeof Instascan !== 'undefined';
            _this.state = {
                scriptLoadingState: isSMapDefined ? LoadingState.Done : LoadingState.NotLoaded
            };
            return _this;
        }
        ContainerCmp.prototype.onScriptLoaded = function () {
            // window.Loader.async = true;
            // window.Loader.load(null, {poi: this.props.poi}, () => {
            this.setState({
                scriptLoadingState: LoadingState.Done,
            });
            // });
        };
        ContainerCmp.prototype.loadScript = function () {
            var scriptUrl = this.props.scriptUrl;
            var scriptElement = document.createElement('script');
            scriptElement.setAttribute('src', scriptUrl);
            scriptElement.addEventListener('load', this.onScriptLoaded.bind(this));
            document.head.appendChild(scriptElement);
            this.setState({
                scriptLoadingState: LoadingState.Loading,
            });
        };
        ContainerCmp.prototype.componentDidMount = function () {
            var scriptLoadingState = this.state.scriptLoadingState;
            if (scriptLoadingState !== LoadingState.NotLoaded || !canUseDOM) {
                return;
            }
            if (typeof Instascan === 'undefined') {
                this.loadScript();
            }
            else {
                this.setState({
                    scriptLoadingState: LoadingState.Done,
                });
            }
        };
        ContainerCmp.prototype.render = function () {
            // const Loader = this.props.loader;
            if (this.state.scriptLoadingState === LoadingState.Done) {
                return React.createElement(Component, __assign({}, this.props));
            }
            return React.createElement("p", null, "Scanner is loading ...");
        };
        ContainerCmp.defaultProps = {
            scriptUrl: 'instascan.min.js',
            poi: false
        };
        return ContainerCmp;
    }(React.Component));
    return ContainerCmp;
};
export default ScannerLoader;
