import {
	IExecuteFunctions,
	IWebhookFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

export class Raia implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'raia',
		name: 'raia',
		group: ['action'],
		version: 1,
		icon: 'file:raia.svg',
		description: 'Interact with Raia API',
		defaults: {
			name: 'raia',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'raiaApi',
				required: true,
			},
		],
		webhooks: [
		],
		properties: [
			{
				displayName: 'Action',
				name: 'action',
				type: 'options',
				options: [
					{ name: 'Prompt an Agent', value: 'promptAgent' },
					{ name: 'Start Email Conversation', value: 'startEmail' },
					{ name: 'Start SMS Conversation', value: 'startSms' },
				],
				default: 'startSms',
			},
			{
				displayName: 'First Name',
				name: 'firstName',
				type: 'string',
				default: '',
				displayOptions: {
					show: { action: ['startSms', 'startEmail'] },
				},
			},
			{
				displayName: 'Last Name',
				name: 'lastName',
				type: 'string',
				default: '',
				displayOptions: {
					show: { action: ['startSms', 'startEmail'] },
				},
			},
			{
				displayName: 'Context',
				name: 'context',
				type: 'string',
				default: 'Support',
				displayOptions: {
					show: { action: ['startSms', 'startEmail'] },
				},
			},
			{
				displayName: 'Source',
				name: 'source',
				type: 'string',
				default: 'crm',
				displayOptions: {
					show: { action: ['startSms', 'startEmail'] },
				},
			},
			{
				displayName: 'fkId',
				name: 'fkId',
				type: 'string',
				default: '',
				displayOptions: {
					show: { action: ['startSms', 'startEmail'] },
				},
			},
			{
				displayName: 'fkUserId',
				name: 'fkUserId',
				type: 'string',
				default: '',
				displayOptions: {
					show: { action: ['startSms', 'startEmail'] },
				},
			},
			{
				displayName: 'Phone Number',
				name: 'phoneNumber',
				type: 'string',
				default: '',
				displayOptions: { show: { action: ['startSms'] } },
			},
			{
				displayName: 'SMS Introduction',
				name: 'smsIntroduction',
				type: 'string',
				default: '',
				displayOptions: { show: { action: ['startSms'] } },
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				placeholder: 'name@email.com',
				default: '',
				displayOptions: { show: { action: ['startEmail'] } },
			},
			{
				displayName: 'Email Subject',
				name: 'emailSubject',
				type: 'string',
				default: '',
				displayOptions: { show: { action: ['startEmail'] } },
			},
			{
				displayName: 'Email Introduction',
				name: 'emailIntroduction',
				type: 'string',
				default: '',
				displayOptions: { show: { action: ['startEmail'] } },
			},
			{
				displayName: 'Include Signature In Email',
				name: 'includeSignatureInEmail',
				type: 'boolean',
				default: false,
				displayOptions: { show: { action: ['startEmail'] } },
			},
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				default: '',
				displayOptions: { show: { action: ['promptAgent'] } },
			},
			{
				displayName: 'Conversation ID',
				name: 'conversationId',
				type: 'string',
				default: '',
				displayOptions: { show: { action: ['sendMessage'] } },
			},
			{
				displayName: 'Message',
				name: 'message',
				type: 'string',
				default: '',
				displayOptions: { show: { action: ['sendMessage'] } },
			},
		],
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const body = this.getBodyData();
		const conversationId = body?.conversationId ?? null;
		const messageId = body?.messageId ?? null;
		const userId = body?.userId ?? null;
		const message = body?.message ?? null;
		const timestamp = body?.timestamp ?? null;

		return {
			workflowData: [
				[
					{
						json: {
							conversationId,
							messageId,
							userId,
							message,
							timestamp,
							fullPayload: body,
						},
					},
				],
			],
		};
	}

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const action = this.getNodeParameter('action', 0) as string;
		const credentials = (await this.getCredentials('raiaApi')) as {
			apiKey: string;
			baseUrl: string;
		};
		const baseUrl = credentials.baseUrl.replace(/\/+$/, '');

		const returnItems: INodeExecutionData[] = [];

		try {
			if (action === 'startSms' || action === 'startEmail') {
				const body: any = {
					firstName: this.getNodeParameter('firstName', 0),
					lastName: this.getNodeParameter('lastName', 0),
					context: this.getNodeParameter('context', 0),
					source: this.getNodeParameter('source', 0),
					fkId: this.getNodeParameter('fkId', 0),
					fkUserId: this.getNodeParameter('fkUserId', 0),
					channel: action === 'startSms' ? 'sms' : action === 'startEmail' ? 'email' : 'voice',
				};

				if (action === 'startSms') {
					body.phoneNumber = this.getNodeParameter('phoneNumber', 0);
					body.smsIntroduction = this.getNodeParameter('smsIntroduction', 0);
				} else if (action === 'startEmail') {
					body.email = this.getNodeParameter('email', 0);
					body.emailSubject = this.getNodeParameter('emailSubject', 0);
					body.emailIntroduction = this.getNodeParameter('emailIntroduction', 0);
					body.includeSignatureInEmail = this.getNodeParameter('includeSignatureInEmail', 0);
				}

				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'raiaApi',
					{
						method: 'POST',
						url: `${baseUrl}/conversations/start`,
						body,
						json: true,
					}
				);
				returnItems.push({ json: response });
			} else if (action === 'promptAgent') {
				const prompt = this.getNodeParameter('prompt', 0) as string;
				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'raiaApi',
					{
						method: 'POST',
						url: `${baseUrl}/prompts`,
						body: { prompt },
						json: true,
					}
				);
				returnItems.push({ json: response });
			} else if (action === 'sendMessage') {
				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'raiaApi',
					{
						method: 'POST',
						url: `${baseUrl}/messages`,
						body: {
							conversationId: this.getNodeParameter('conversationId', 0),
							message: this.getNodeParameter('message', 0),
						},
						json: true,
					}
				);
				returnItems.push({ json: response });
			} else {
				throw new NodeApiError(this.getNode(), { message: 'Unknown Action' });
			}
		} catch (error) {
			throw new NodeApiError(this.getNode(), error);
		}

		return [returnItems];
	}
}
