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
		group: ['trigger'],
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
			// {
			// 	name: 'default',
			// 	httpMethod: 'POST',
			// 	responseMode: 'onReceived',
			// 	path: 'raia-webhook',
			// },
		],
		properties: [
			{
				displayName: 'Action',
				name: 'action',
				type: 'options',
				options: [
					{ name: 'Chat with Agent', value: 'chatWithAgent' },
					{ name: 'Prompt an Agent', value: 'promptAgent' },
					{ name: 'Send Message', value: 'sendMessage' },
					{ name: 'Start Email Conversation', value: 'startEmail' },
					{ name: 'Start SMS Conversation', value: 'startSms' },
					// { name: 'Start Voice Conversation', value: 'startVoice' },
					// { name: 'Wait for Reply (Webhook)', value: 'waitForReply' },

				],
				default: 'startSms',
			},

			// Common fields
			{
				displayName: 'First Name',
				name: 'firstName',
				type: 'string',
				default: '',
				displayOptions: {
					show: { action: ['startSms', 'startEmail', 'startVoice', 'chatWithAgent'] },
				},
			},
			{
				displayName: 'Last Name',
				name: 'lastName',
				type: 'string',
				default: '',
				displayOptions: {
					show: { action: ['startSms', 'startEmail', 'startVoice', 'chatWithAgent'] },
				},
			},
			{
				displayName: 'Context',
				name: 'context',
				type: 'string',
				default: 'Support',
				displayOptions: {
					show: { action: ['startSms', 'startEmail', 'startVoice', 'chatWithAgent'] },
				},
			},
			{
				displayName: 'Source',
				name: 'source',
				type: 'string',
				default: 'crm',
				displayOptions: {
					show: { action: ['startSms', 'startEmail', 'startVoice', 'chatWithAgent'] },
				},
			},
			{
				displayName: 'fkId',
				name: 'fkId',
				type: 'string',
				default: '',
				displayOptions: {
					show: { action: ['startSms', 'startEmail', 'startVoice', 'chatWithAgent'] },
				},
			},
			{
				displayName: 'fkUserId',
				name: 'fkUserId',
				type: 'string',
				default: '',
				displayOptions: {
					show: { action: ['startSms', 'startEmail', 'startVoice', 'chatWithAgent'] },
				},
			},

			// Specific fields
			{
				displayName: 'Phone Number',
				name: 'phoneNumber',
				type: 'string',
				default: '',
				displayOptions: { show: { action: ['startSms', 'startVoice'] } },
			},
			{
				displayName: 'SMS Introduction',
				name: 'smsIntroduction',
				type: 'string',
				default: '',
				displayOptions: { show: { action: ['startSms'] } },
			},
			{
				displayName: 'Voice Introduction',
				name: 'voiceIntroduction',
				type: 'string',
				default: '',
				displayOptions: { show: { action: ['startVoice'] } },
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

		// Safely destructure with default values or optional chaining
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
		const baseUrl = credentials.baseUrl.replace(/\/+$/, ''); // Trim trailing slashes

		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			'Agent-Secret-Key': credentials.apiKey,
		};

		const returnItems: INodeExecutionData[] = [];

		try {
			if (action === 'startSms' || action === 'startEmail' || action === 'startVoice') {
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
				} else if (action === 'startVoice') {
					body.phoneNumber = this.getNodeParameter('phoneNumber', 0);
					body.voiceIntroduction = this.getNodeParameter('voiceIntroduction', 0);
				}

				const response = await this.helpers.httpRequest({
					method: 'POST',
					url: `${baseUrl}/conversations/start`,
					headers,
					body,
					json: true,
				});
				returnItems.push({ json: response });
			} else if (action === 'chatWithAgent') {
				const userResponse = await this.helpers.httpRequest({
					method: 'POST',
					url: `${baseUrl}/users`,
					headers,
					body: {
						firstName: this.getNodeParameter('firstName', 0),
						lastName: this.getNodeParameter('lastName', 0),
						context: this.getNodeParameter('context', 0),
						source: this.getNodeParameter('source', 0),
						fkId: this.getNodeParameter('fkId', 0),
						fkUserId: this.getNodeParameter('fkUserId', 0),
						phoneNumber: this.getNodeParameter('phoneNumber', 0) || undefined,
						email: this.getNodeParameter('email', 0) || undefined,
					},
					json: true,
				});
				const conversationResponse = await this.helpers.httpRequest({
					method: 'POST',
					url: `${baseUrl}/conversations`,
					headers,
					body: { conversationUserId: userResponse.id, title: 'Chat with Agent' },
					json: true,
				});
				returnItems.push({ json: conversationResponse });
			} else if (action === 'promptAgent') {
				const prompt = this.getNodeParameter('prompt', 0) as string;
				const response = await this.helpers.httpRequest({
					method: 'POST',
					url: `${baseUrl}/prompts`,
					headers,
					body: { prompt },
					json: true,
				});
				returnItems.push({ json: response });
			} else if (action === 'waitForReply') {
				// Handled in webhook
				return [];
			} else if (action === 'sendMessage') {
				const response = await this.helpers.httpRequest({
					method: 'POST',
					url: `https://api.raia2.com/external/messages`,
					headers,
					body: {
						conversationId: this.getNodeParameter('conversationId', 0),
						message: this.getNodeParameter('message', 0),
					},
					json: true,
				});
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
