import {
	type ITriggerFunctions,
	type INodeType,
	type INodeTypeDescription,
	type ITriggerResponse,
} from 'n8n-workflow';

export class FileUpLoadTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'File UpLoad Trigger',
    name: 'fileUpLoadTrigger',
    icon: 'file:fileUpload.svg',
		group: ['trigger'],
    version: 1,
    description: 'Runs the workflow when upload file is submitted',
    defaults: {
      name: 'File UpLoad Trigger',
      color: '#1A82e2',
    },
    inputs: [],
    outputs: ['main'],
    credentials: [],
    properties: [
      // {
      //   displayName: 'Accept File Type',
      //   name: 'accept',
      //   type: 'string',
      //   default: '.txt,.doc,.docx,.pdf',
      //   placeholder: '请输入上传文件类型 .txt,.doc,.docx,.pdf'
      // },
      // {
      //   displayName: 'Upload Action',
      //   name: 'action',
      //   type: 'string',
      //   default: '',
      //   placeholder: '请输入文件上传地址'
      // },
      // {
      //   displayName: 'File Max Size（M）',
      //   name: 'size',
      //   type: 'number',
      //   default: '10',
      //   placeholder: '请选择文件'
      // },
      // {
      //   displayName: 'Select File',
      //   name: 'file',
      //   type: 'file',
      //   default: '',
      //   placeholder: '请选择文件'
      // }
      // Node properties which the user gets displayed and
      // can change on the node.
    ]
  };

  async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		const manualTriggerFunction = async () => {
			this.emit([this.helpers.returnJsonArray([{}])]);
		};

		return {
			manualTriggerFunction,
		};
	}
}
