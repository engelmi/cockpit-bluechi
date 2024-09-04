/*
 * This file is part of Cockpit.
 *
 * Copyright (C) 2017 Red Hat, Inc.
 *
 * Cockpit is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation; either version 2.1 of the License, or
 * (at your option) any later version.
 *
 * Cockpit is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Cockpit; If not, see <http://www.gnu.org/licenses/>.
 */

import React, { useState } from 'react';

import { Accordion } from '@patternfly/react-core';

import { BlueChiClient } from "./api/bluechi";
import { BlueChiNode } from "./model/bluechi";
import { BlueChiNodeComponent } from "./components/bluechi-node";

export const Application = () => {
    const [shouldInitialize, setShouldInitialize] = useState(false);
    const [bluechiNodes, setBlueChiNodes] = useState<BlueChiNode[]>([]);

    (async () => {
        if(!shouldInitialize){
            const client = BlueChiClient.getClient();
            const nodes = await client.listNodes()
            setBlueChiNodes(nodes)

            setShouldInitialize(true)
        }
    })();

    return (
        <div className='bluechi-overview'>
            <Accordion asDefinitionList={false} displaySize='lg' isBordered={true}>
            {
                bluechiNodes.map((node, i)=> {
                    return (
                        <BlueChiNodeComponent
                            key={i}
                            node={node}>
                        </BlueChiNodeComponent>)
                })
            }
            </Accordion>
        </div>
    );
};
