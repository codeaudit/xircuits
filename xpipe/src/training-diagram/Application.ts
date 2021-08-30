import * as SRD from '@projectstorm/react-diagrams';
import {CustomNodeFactory} from "./components/CustomNodeFactory";
import { CustomNodeModel } from './components/CustomNodeModel';

/**
 * @author Dylan Vorster
 */
export class Application {

	protected activeModel: SRD.DiagramModel;

	protected diagramEngine: SRD.DiagramEngine;

	constructor() {
		this.diagramEngine = SRD.default();

		this.activeModel = new SRD.DiagramModel();

		this.diagramEngine.getNodeFactories().registerFactory(new CustomNodeFactory());
		//this.diagramEngine.getLinkFactories().registerFactory(new PathFindingLinkFactory());
		
		// initialize default start and finish node
		let startNode = new CustomNodeModel({ name:'Start', color:'rgb(255,102,102)', extras:{ "type":"Start" } });
		startNode.addOutPortEnhance('▶', 'out-0');
		startNode.addOutPortEnhance('  ', 'parameter-out-1');
		startNode.setPosition(100, 100);

		let finishedNode = new CustomNodeModel({ name:'Finish', color:'rgb(255,102,102)', extras:{ "type":"Finish" } });
		finishedNode.addInPortEnhance('▶', 'in-0');
		finishedNode.addInPortEnhance('  ', 'parameter-in-1');
		finishedNode.setPosition(700, 100);

		this.activeModel.addAll(startNode, finishedNode);
		this.diagramEngine.setModel(this.activeModel);
	}



	public getActiveDiagram(): SRD.DiagramModel {
		return this.activeModel;
	}

	public getDiagramEngine(): SRD.DiagramEngine {
		return this.diagramEngine;
	}
}
