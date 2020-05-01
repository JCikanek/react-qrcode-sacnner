/**
 * Created by jcika on 11.02.2020.
 **/
import * as React from "react";
import {ComponentType} from "react";

enum LoadingState {
    NotLoaded,
    Loading,
    Done
}

declare module Instascan {
    class Scanner {
        constructor(node: any) ;
    }
}

const canUseDOM = !!(
    typeof window !== 'undefined' &&
    window.document &&
    window.document.createElement
);

interface CmpProps {
    scriptUrl: string,
    poi: boolean
}

interface CmpState {
    scriptLoadingState: LoadingState,
}



const ScannerLoader = (Component: ComponentType<any>):any => {
   class ContainerCmp extends React.Component<CmpProps, CmpState> {
        static defaultProps = {
            scriptUrl: 'instascan.min.js',
            poi: false
        };


        constructor(props: CmpProps, context: any) {
            super(props, context);
            const isSMapDefined = typeof Instascan !== 'undefined';
            this.state = {
                scriptLoadingState: isSMapDefined ? LoadingState.Done : LoadingState.NotLoaded
            };
        }

        onScriptLoaded() {
            // window.Loader.async = true;
            // window.Loader.load(null, {poi: this.props.poi}, () => {
            this.setState({
                scriptLoadingState: LoadingState.Done,
            });
            // });
        }

        loadScript() {
            const {scriptUrl} = this.props;
            const scriptElement = document.createElement('script');
            scriptElement.setAttribute('src', scriptUrl);
            scriptElement.addEventListener('load', this.onScriptLoaded.bind(this));
            document.head.appendChild(scriptElement);

            this.setState({
                scriptLoadingState: LoadingState.Loading,
            });
        }

        componentDidMount() {
            const {scriptLoadingState} = this.state;

            if (scriptLoadingState !== LoadingState.NotLoaded || !canUseDOM) {
                return;
            }

            if (typeof Instascan === 'undefined') {
                this.loadScript();
            } else {
                this.setState({
                    scriptLoadingState: LoadingState.Done,
                });
            }

        }


        render() {
            // const Loader = this.props.loader;
            if (this.state.scriptLoadingState === LoadingState.Done) {
                return <Component {...this.props}/>;
            }
            return <p>Scanner is loading ...</p>;
        }
    }

    return ContainerCmp;
};

export default ScannerLoader;