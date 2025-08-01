![Banner image](https://user-images.githubusercontent.com/10284570/173569848-c624317f-42b1-45a6-ab09-f0ea3c247648.png)

# 📡 n8n-nodes-raia

**Custom n8n Node** to interact with the **Raia** platform for managing AI-powered and human-led conversations via SMS, Email, or Voice.

## 🚀 Features

This node allows you to:
- Start new conversations (SMS, Email)
- Chat or prompt an agent
- Use Raia's platform in a single, unified node

## 🔧 Node Actions

| Action                     | Description                                                  |
|---------------------------|--------------------------------------------------------------|
| Start SMS Conversation    | Initiate a conversation via SMS                              |
| Start Email Conversation  | Initiate a conversation via Email                            |
| Prompt an Agent           | Send a prompt to an agent                                    |

## 🧩 Node Parameters

### Common Parameters (used in most actions)
- **First Name**
- **Last Name**
- **Context** (e.g., "Support")
- **Source** (e.g., "crm")
- **fkId**
- **fkUserId**

### Channel-Specific Parameters

#### SMS
- **Phone Number**
- **SMS Introduction** (for SMS)

#### Email
- **Email Address**
- **Email Subject**
- **Email Introduction**
- **Include Signature in Email** (boolean)

### Prompt Agent
- **Prompt**

```json
{
  "conversationId": "string",
  "messageId": "string",
  "userId": "string",
  "message": "string",
  "timestamp": "ISODate"
}
```

## Installation

Follow these steps to install this community node in your n8n instance:

1. Open n8n.
2. Go to **Settings** > **Community Nodes**.
3. Click **Install Community Node**.
4. Enter the name of this package: `n8n-nodes-raia`
5. Click **Install**.

For more details, see the [official n8n documentation](https://docs.n8n.io/integrations/community-nodes/installation/verified-install/).

## License

[MIT](https://github.com/n8n-io/n8n-nodes-starter/blob/master/LICENSE.md)
