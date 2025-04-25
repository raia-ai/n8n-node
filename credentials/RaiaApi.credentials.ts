import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class RaiaApi implements ICredentialType {
	name = 'raiaApi';

	displayName = 'Raia API';

	documentationUrl = 'https://api.raia2.com/api/external/docs';

	icon = 'file:icons/raia.svg' as const;

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
		},
		{
			displayName: 'API Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.raia2.com/external',
			placeholder: 'https://api.raia2.com/external',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'Agent-Secret-Key': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			method: 'GET',
			url: 'https://api.raia2.com/external/agents/by-api-key',
			json: true,
		},
	};
}
