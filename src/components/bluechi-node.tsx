import React, { Component, ReactNode } from 'react';
import { Icon } from '@patternfly/react-core';
import CheckCircleIcon from '@patternfly/react-icons/dist/esm/icons/check-circle-icon';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import { AccordionItem, AccordionContent, AccordionToggle } from '@patternfly/react-core';

import { BlueChiUnitComponent } from './bluechi-unit'
import { BlueChiNode } from '../model/bluechi';
import { BlueChiClient } from '../api/bluechi';

interface Props{
    node: BlueChiNode
}

interface State{
    node: BlueChiNode,
    isExpanded: boolean,
}

export class BlueChiNodeComponent extends Component<Props, State> {
    
    state: State;

    constructor(props: Props){
        super(props);

        this.state = {
            node: {
                nodeName: props.node.nodeName,
                nodeState: props.node.nodeState,
                nodePath: props.node.nodePath,
                nodeIP: props.node.nodeIP,
            },
            isExpanded: false,
        };

        const client = BlueChiClient.getClient();
        client.setupNodeMonitor(this.state.node.nodePath, this.update)
    }

    update = (state: string) : void => {
        const newState: State = {
            node: {
                nodeName: this.state.node.nodeName,
                nodeState: state,
                nodePath: this.state.node.nodePath,
                nodeIP: this.state.node.nodeIP,
            },
            isExpanded: this.state.isExpanded,
        };
        this.setState(newState);
    }

    render = (): ReactNode => {
        let icon;
        let unitComponent;
        if(this.state.node.nodeState === "online"){
            icon = <Icon status="success"><CheckCircleIcon /></Icon>;
            unitComponent = <BlueChiUnitComponent 
                                nodePath={this.state.node.nodePath}
                                units={[]}>
                            </BlueChiUnitComponent>
        } else{
            icon = <Icon status="danger"><ExclamationCircleIcon /></Icon>
            unitComponent = <div></div>
        }


        return (
            <AccordionItem>
                <AccordionToggle 
                    id={"node-" + this.state.node.nodeName + "-toggle"}
                    onClick={() => {
                        var newState = this.state;
                        newState.isExpanded = !newState.isExpanded
                        this.setState(newState);
                    }}
                    isExpanded={this.state.isExpanded}
                    >
                    {icon} <div className='accordion-toggle'>{this.state.node.nodeName}</div>
                </AccordionToggle>
                <AccordionContent
                    id={"node-" + this.state.node.nodeName + "-content"}
                    isHidden={!this.state.isExpanded}
                    isFixed
                    height="500px"
                    >
                    
                    {unitComponent}

                </AccordionContent>
            </AccordionItem>
        )
    }
}
