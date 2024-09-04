import React, { Component, ReactNode, useEffect } from 'react';
import { DataList, DataListItem, DataListItemRow, DataListItemCells, DataListCell } from '@patternfly/react-core';

import { BlueChiUnit } from '../model/bluechi';
import { BlueChiClient } from '../api/bluechi';

interface Props{
    nodePath: string,
    units: BlueChiUnit[]
}

interface State{
    initialized: boolean,
    nodePath: string,
    units: BlueChiUnit[],
}

export class BlueChiUnitComponent extends Component<Props, State> {
    
    state: State;

    constructor(props: Props){
        super(props);

        this.state = {
            initialized: false,
            nodePath: this.props.nodePath,
            units: [],
        };
    }

    componentDidMount(): void {
        if(this.state.initialized){
            return;
        }
        
        const client = BlueChiClient.getClient();
        const nodeName = this.state.nodePath.split("/").pop()
        if(nodeName === undefined){
            return;
        }
        client.setupUnitMonitor(nodeName, this.updateUnitState);
        
        (async () => {
            if(this.state.initialized){
                return;
            }
            const units = await client.listUnits(this.state.nodePath);
            units.sort((a, b) => {return a.unitName > b.unitName ? -1 : 1});
            this.setState({
                units: units, 
                nodePath: this.state.nodePath,
                initialized: this.state.initialized,
            });
        })();
    }

    updateUnitState = (unitName: string, activeState: string, subState: string) => {
        const { units } = this.state;
        units.map( (unit) => {
            if(unit.unitName == unitName) {
                unit.unitActiveState = activeState;
                unit.unitSubState = subState;
            }
            return unit;
        });
        this.setState({
            initialized: this.state.initialized,
            nodePath: this.state.nodePath,
            units: units,
        });
    }

    render = (): ReactNode => {
        
        return (
            <DataList aria-label="Simple data list example">
                <DataListItem aria-labelledby="header">
                    <DataListItemRow>
                        <DataListItemCells
                        key={"datalist-" + this.state.nodePath}
                        dataListCells={[
                            <DataListCell key="unit-name-header">
                                <h2>Name</h2>
                            </DataListCell>,
                            <DataListCell key="unit-description-header">
                                Description
                            </DataListCell>,
                            <DataListCell key="unit-active-state-header">
                                Active State
                            </DataListCell>,
                            <DataListCell key="unit-sub-state-header">
                                Sub State
                            </DataListCell>,
                            <DataListCell key="unit-objpath-header">
                                ObjectPath
                            </DataListCell>
                        ]}
                        />
                    </DataListItemRow>
                </DataListItem>
                {
                    this.state.units.map((unit, i)=> {
                        return (
                            <DataListItem aria-labelledby={unit.unitName}>
                                <DataListItemRow
                                    key={"data-list-row-" + unit.unitName + "-" + i}>
                                    <DataListItemCells
                                    key={"data-list-cells-" + unit.unitName + "-" + i}
                                    dataListCells={[
                                        <DataListCell key={unit.unitName + "-name-" + i}>
                                            {unit.unitName}
                                        </DataListCell>,
                                        <DataListCell key={unit.unitName + "-description-" + i}>
                                            {unit.unitDescription}
                                        </DataListCell>,
                                        <DataListCell key={unit.unitName + "-active-state-" + i}>
                                            {unit.unitActiveState}
                                        </DataListCell>,
                                        <DataListCell key={unit.unitName + "-sub-state-" + i}>
                                            {unit.unitSubState}
                                        </DataListCell>,
                                        <DataListCell key={unit.unitName + "-objectpath-" + i}>
                                            {unit.unitObjectPath}
                                        </DataListCell>
                                    ]}
                                    />
                                </DataListItemRow>
                            </DataListItem>
                        )
                    })
                }
            </DataList>
        )
    }
}
