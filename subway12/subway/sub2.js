//Collaboration
var input_graph = {
"nodes": [
    { "name": "D1", "description": "Provisioning the Office 365 and initial configuration", "group": "Collaboration", "type": "stop", "fixed": true, "x": 40, "y": 40, "line_color": "#f00", "fill_color": "#fee", "stroke_color": "#000" },
    { "name": "D2", "description": "Manage custom domains in Office 365", "group": "Programming", "type": "stop" },
    { "name": "D3", "description": "Administer WAAD Rights Management", "group": "Programming", "type": "stop" },
    { "name": "D4", "description": "Manage user, security groups and licenses for cloud identities", "group": "Programming", "type": "stop" },
    { "name": "D5", "description": "Implement and manage identities by using DirSync", "group": "Programming", "type": "stop" },
    { "name": "D6", "description": "Implement and manage federated identities", "group": "Programming", "type": "stop" },
    { "name": "D7", "description": "Monitor and troubleshoot Office 365 availability", "group": "Programming", "type": "badge", "label": "Programming Technology Specialist", "fixed": true, "x": 840, "y": 420, "line_color": "#00f", "fill_color": "#ff0", "stroke_color": "#4f5" },
    { "name": "W1", "description": "Manage and implement Exchange Online", "group": "Web App", "type": "stop", "fixed": true, "x": 60, "y": 220 },
    { "name": "W2", "description": "Manage and implement Skype for Business Online", "group": "Web App", "type": "stop" },
    { "name": "W3", "description": "Manage and implement SharePoint Online site collections", "group": "Web App", "type": "stop" },
    { "name": "W4", "description": "Implement and manage Transport", "group": "Web App", "type": "group" },
    { "name": "W5", "description": "Implement and manage Mailbox Role", "group": "Web App", "type": "stop" },	
    { "name": "W6", "description": "Implement and manage Client Access Role", "group": "Web App", "type": "stop" },	
    { "name": "W7", "description": "Plan and Configure Exchange Management (RBAC, AD) and SLAs", "group": "Web App", "type": "stop" },	
    { "name": "W8", "description": "Implement and manage compliance and archiving", "group": "Web App", "type": "stop" },	
    { "name": "W9", "description": "Implement and manage coexistence, hybrid scenarios, and migration", "group": "Web App", "type": "stop"},
    { "name": "W10", "description": "Implement and manage Skype for Business topology", "group": "Web App", "type": "group" },
    { "name": "W11", "description": "Implement and manage Skype for Business clients and features", "group": "Web App", "type": "group" },
    { "name": "W12", "description": "Troubleshoot and monitor Skype for Business", "group": "Web App", "type": "group" },
    { "name": "W13", "description": "Implement and manage Enterprise Voice", "group": "Web App", "type": "group" },
    { "name": "W14", "description": "Design and configure network services for Skype for Business", "group": "Web App", "type": "group", "fixed": true, "x": 840, "y": 120 },
    { "name": "S1", "description": "Implement and manage Skype for Business Online and migration", "group": "Collaboration", "type": "group", "fixed": true, "x": 760, "y": 240 },
    { "name": "S2", "description": "Architecting and Installing SharePoint", "group": "Collaboration", "type": "group" },
    { "name": "S3", "description": "Manage User Access ", "group": "Collaboration", "type": "group" },
    { "name": "S4", "description": "Manage workload optimization", "group": "Collaboration", "type": "group" },
    { "name": "S5", "description": "Manage Productivity Solutions", "group": "Collaboration", "type": "group" },
    { "name": "S6", "description": "Implement Enterprise Search", "group": "Collaboration", "type": "group" },
    { "name": "S7", "description": "Configure Advanced Productivity tools ", "group": "Collaboration", "type": "group" },
	
    { "name": "S8", "description": "Design SharePoint Architecture", "group": "Collaboration", "type": "stop", "duration":"1.5" },
    { "name": "S9", "description": "Plan a SharePoint Online deployment", "group": "Collaboration", "type": "stop", "duration":"1" },
	{ "name": "S9", "description": "Plan and configure user access", "group": "Collaboration", "type": "stop", "duration":"1" },
	{ "name": "S9", "description": "Plan and configure security", "group": "Collaboration", "type": "stop", "duration":"1" },
	{ "name": "S9", "description": "Plan installation", "group": "Collaboration", "type": "stop", "duration":".5" },
	{ "name": "S9", "description": "Create and configure a User Profile Service (UPA) application", "group": "Collaboration", "type": "stop", "duration":"1" },
	{ "name": "S9", "description": "Provision and configure web applications", "group": "Collaboration", "type": "stop", "duration":".5" },
	{ "name": "S9", "description": "Create and maintain site collections", "group": "Collaboration", "type": "stop", "duration":"1" },
	{ "name": "S9", "description": "Plan and Configure a social workload", "group": "Collaboration", "type": "stop", "duration":".5" },
	{ "name": "S9", "description": "Optimize a SharePoint environment", "group": "Collaboration", "type": "stop", "duration":".5" },
	{ "name": "S9", "description": "Plan SharePoint high availability", "group": "Collaboration", "type": "stop", "duration":"1.5" },
	{ "name": "S9", "description": "Plan backup and restore", "group": "Collaboration", "type": "stop", "duration":".5" },
	{ "name": "S9", "description": "Plan and configure a Web Content Management (WCM) workload", "group": "Collaboration", "type": "stop", "duration":"1" },
	{ "name": "S9", "description": "Plan an Enterprise Content Management (ECM) workload", "group": "Collaboration", "type": "stop", "duration":"1" },
	{ "name": "S9", "description": "Evaluate content and customizations", "group": "Collaboration", "type": "stop", "duration":"1" },
	{ "name": "S9", "description": "Plan and execute an upgrade process", "group": "Collaboration", "type": "stop", "duration":"1" },
	{ "name": "S9", "description": "Create and configure app management", "group": "Collaboration", "type": "stop", "duration":"1" },
	{ "name": "S9", "description": "Create and configure productivity services", "group": "Collaboration", "type": "stop", "duration":".5" },
	{ "name": "S9", "description": "Create and configure a Business Connectivity Service (BCS) and Secure Store application", "group": "Collaboration", "type": "stop", "duration":".5" },
	{ "name": "S9", "description": "Manage SharePoint solutions and applications", "group": "Collaboration", "type": "stop", "duration":".5" },
	{ "name": "S9", "description": "Create and configure enterprise search", "group": "Collaboration", "type": "stop", "duration":"1.5" },
	{ "name": "S9", "description": "Create and configure a Managed Metadata Service (MMS) application", "group": "Collaboration", "type": "stop", "duration":"1" },
	{ "name": "S9", "description": "Manage Term Store", "group": "Collaboration", "type": "stop", "duration":"1.5" },
	{ "name": "S9", "description": "Plan and configure a search workload", "group": "Collaboration", "type": "stop", "duration":".5" },
	{ "name": "S9", "description": "Plan and configure a BI infrastructure", "group": "Collaboration", "type": "stop", "duration":"1" },
	{ "name": "S9", "description": "Create and configure work management", "group": "Collaboration", "type": "stop", "duration":".5" },
	
	{ "name": "S9", "description": "Design, Implement and manage a Skype for Business site topology and support infrastructure", "group": "Communication", "type": "stop", "duration":"1.5" },
	{ "name": "S9", "description": "Design, implement and manage a Skype for Business Server HA/DR solution", "group": "Communication", "type": "stop", "duration":"2" },
	{ "name": "S9", "description": "Design, Implement and Manage Skype for Business remote and external access using Edge Services", "group": "Communication", "type": "stop", "duration":"1.5" },
	{ "name": "S9", "description": "Design, implement and manage Skype for Business conferencing", "group": "Communication", "type": "stop", "duration":"1" },
	{ "name": "S9", "description": "Design, implement and manage Skype for Business clients, devices, persistent chat and user experience", "group": "Communication", "type": "stop", "duration":"1.5" },
	{ "name": "S9", "description": "Troubleshoot the Skype for Business environment and verify environment health", "group": "Communication", "type": "stop", "duration":"2" },
	{ "name": "S9", "description": "Design, implement and manage Skype for Business monitoring and archiving services", "group": "Communication", "type": "stop", "duration":"1" },
	{ "name": "S9", "description": "Design, implement and manage Enterprise Voice topology", "group": "Communication", "type": "stop", "duration":"1.5" },
	{ "name": "S9", "description": "Design, implement and manage call routing", "group": "Communication", "type": "stop", "duration":"1.5" },
	{ "name": "S9", "description": "Design, implement and manage voice interoperability to PSTN", "group": "Communication", "type": "stop", "duration":"1" },
	{ "name": "S9", "description": "Design, implement and manage voice applications", "group": "Communication", "type": "stop", "duration":"1" },
	{ "name": "S9", "description": "Design, implement and manage unified messaging for Skype for Business and Skype for Business Online", "group": "Communication", "type": "stop", "duration":"1" },
	{ "name": "S9", "description": "Design, implement and manage for network optimization and services", "group": "Communication", "type": "stop", "duration":"1.5" },
	{ "name": "S9", "description": "Design, implement and manage coexistence with and migration to Skype for Business Online", "group": "Communication", "type": "stop", "duration":"1.5" },
	{ "name": "S9", "description": "Migrate to Skype for Business from previous versions", "group": "Communication", "type": "stop", "duration":"1" },

	{ "name": "S9", "description": "Design a transport solution", "group": "Messaging", "type": "stop", "duration":"1.5" },
	{ "name": "S9", "description": "Configure and manage transport", "group": "Messaging", "type": "stop", "duration":"1.5" },
	{ "name": "S9", "description": "Configure and manage hygiene", "group": "Messaging", "type": "stop", "duration":"1" },
	{ "name": "S9", "description": "Plan the Exchange Server 2013 mailbox role", "group": "Messaging", "type": "stop", "duration":"1" },
	{ "name": "S9", "description": "Configure and manage the mailbox role", "group": "Messaging", "type": "stop", "duration":"1" },
	{ "name": "S9", "description": "Deploy and manage high availability solutions for the mailbox role", "group": "Messaging", "type": "stop", "duration":"1" },
	{ "name": "S9", "description": "Develop backup and recovery solutions for the mailbox role and public folders", "group": "Messaging", "type": "stop", "duration":".5" },
	{ "name": "S9", "description": "Design, deploy, and manage a site resilient Exchange solution", "group": "Messaging", "type": "stop", "duration":".5" },
	{ "name": "S9", "description": "Plan, deploy, and manage a Client Access Server (CAS) and configure namespaces", "group": "Messaging", "type": "stop", "duration":"1" },
	{ "name": "S9", "description": "Deploy and manage mobility solutions", "group": "Messaging", "type": "stop", "duration":"1" },
	{ "name": "S9", "description": "Implement load balancing", "group": "Messaging", "type": "stop", "duration":"1" },
	{ "name": "S9", "description": "Design an appropriate Exchange solution for a given SLA", "group": "Messaging", "type": "stop", "duration":".5" },
	{ "name": "S9", "description": "Create and configure mail-enabled objects", "group": "Messaging", "type": "stop", "duration":"1.5" },
	{ "name": "S9", "description": "Plan and manage Role Based Access Control (RBAC)", "group": "Messaging", "type": "stop", "duration":"1" },
	{ "name": "S9", "description": "Plan and Implement an appropriate security strategy", "group": "Messaging", "type": "stop", "duration":"1" },
	{ "name": "S9", "description": "Configure and interpret mailbox and administrative auditing", "group": "Messaging", "type": "stop", "duration":"1" },
	{ "name": "S9", "description": "Configure and manage an archiving solution", "group": "Messaging", "type": "stop", "duration":"1" },
	{ "name": "S9", "description": "Design and configure Data Loss Prevention (DLP) solutions", "group": "Messaging", "type": "stop", "duration":"1" },
	{ "name": "S9", "description": "Implement a compliance solution", "group": "Messaging", "type": "stop", "duration":"1" },
	{ "name": "S9", "description": "Manage coexistence with and migration to Exchange Online", "group": "Messaging", "type": "stop", "duration":"1" },
	{ "name": "S9", "description": "Manage on-premises coexistence with and migration of legacy systems", "group": "Messaging", "type": "stop", "duration":".5" },
],

   "links": [
        {
            "source": 1,
            "target": 0,
            "value": 1
        },
        {
            "source": 2,
            "target": 1,
            "value": 1
        },
        {
            "source": 3,
            "target": 2,
            "value": 1
        },
        {
            "source": 4,
            "target": 3,
            "value": 1
        },
        {
            "source": 5,
            "target": 4,
            "value": 1
        },
        {
            "source": 6,
            "target": 5,
            "value": 1
        },
        {
            "source": 7,
            "target": 6,
            "value": 1
        },
        {
            "source": 8,
            "target": 7,
            "value": 1
        },
        {
            "source": 9,
            "target": 8,
            "value": 1
        },
        {
            "source": 10,
            "target": 9,
            "value": 1
        },
        {
            "source": 11,
            "target": 10,
            "value": 1
        },
        {
            "source": 12,
            "target": 11,
            "value": 1
        },
        {
            "source": 13,
            "target": 12,
            "value": 1
        },
        {
            "source": 14,
            "target": 13,
            "value": 1
        },
        {
            "source": 15,
            "target": 14,
            "value": 1
        },
        {
            "source": 16,
            "target": 11,
            "value": 1
        },
        {
            "source": 17,
            "target": 16,
            "value": 1
        },
        {
            "source": 18,
            "target": 17,
            "value": 1
        },
        {
            "source": 19,
            "target": 18,
            "value": 1
        },
        {
            "source": 20,
            "target": 19,
            "value": 1
        },
        {
            "source": 21,
            "target": 6,
            "value": 1
        },
        {
            "source": 22,
            "target": 21,
            "value": 1
        },
        {
            "source": 23,
            "target": 22,
            "value": 1
        },
        {
            "source": 24,
            "target": 23,
            "value": 1
        },
        {
            "source": 25,
            "target": 24,
            "value": 1
        },
        {
            "source": 26,
            "target": 25,
            "value": 1
        },
        {
            "source": 27,
            "target": 26,
            "value": 1
        },
        {
            "source": 28,
            "target": 27,
            "value": 1
        },
        {
            "source": 29,
            "target": 28,
            "value": 1
        },
        {
            "source": 30,
            "target": 6,
            "value": 1
        },
        {
            "source": 31,
            "target": 30,
            "value": 1
        },
        {
            "source": 32,
            "target": 31,
            "value": 1
        },
        {
            "source": 33,
            "target": 32,
            "value": 1
        },
        {
            "source": 34,
            "target": 33,
            "value": 1
        },
        {
            "source": 35,
            "target": 34,
            "value": 1
        },
        {
            "source": 36,
            "target": 35,
            "value": 1
        },
        {
            "source": 37,
            "target": 36,
            "value": 1
        },
        {
            "source": 38,
            "target": 37,
            "value": 1
        },
        {
            "source": 39,
            "target": 38,
            "value": 1
        },
        {
            "source": 40,
            "target": 39,
            "value": 1
        },
        {
            "source": 41,
            "target": 40,
            "value": 1
        },
        {
            "source": 42,
            "target": 41,
            "value": 1
        },
        {
            "source": 43,
            "target": 42,
            "value": 1
        }
    ]

}
