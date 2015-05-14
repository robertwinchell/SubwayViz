var input_tree = {
 "nodes": {
  "F": ["Data Platform Fundamentals", {"colors": ["white", "gray", "gray"]}],
  "F1": "Database Fundamentals",
  "F1a": "Database Fundamentals (2 days)",
  "F2": "Cloud Service Fundamentals for Data",
  "F2a": "Azure Fundamentals for Data and Storage (1 day)",
  "F2b": "Azure SQL Database Fundamentals (1 day)",
  "F3": ["Query Data using Transact-SQL", {"nl": "cr"}],

  "P": ["Database Application Development",
	{"colors": ["white", "gray", "purple"], "par": "F", "nl": "cr"}],
  "P1": "Develop Relational Databases",
  "P1a": "Design & Implement Tables, Indexes and Views (1.5 days)",
  "P1b":"Design & Implement Stored Procedures, Functions, and Triggers (1 day)",
  "P1c": "Manage Transactions, Locking, and Isolation (1 day)",
  "P1d": "Implement In-Memory Database Objects (1 day)",
  "P1e": "Implement Managed Code in a Database (0.5 day)",
  "P2": "Develop Data Access Clients",
  "P2a": "Implement Data Clients with Entity Framework (1 day)",
  "P2b": "Query Data Sources with LINQ (1 day)",
  "P3": "Performance Tune and Optimize Relational Databases",
  "P3a": "Optimize a Database (1 day)",
  "P3b": "Troubleshoot Query Performance (1 day)",
  "P3c": "Optimize Azure SQL Database Performance and Scalability",
  "P4": "Develop Non-Relational Databases",
  "P4a": "Implement XML in a Database (1 day)",
  "P4b": "Implement Spatial Data in a Database (1 day)",
  "P4c": "Implement Files and Full Text in a Database (0.5 day)",
  "P4d": "Implement Azure Document in DB (1 day)",
  "P4e": "Implement MongoDB (1 day)",
  "P4f": "Implement Redis Cache (1 day)",
  "P5": "Database Application Development",

  "M": ["Database Administration",
	{"colors": ["white", "gray", "aqua"], "par": "F"}],
  "M1": "Infrastructure Fundamentals",
  "M1a": "Windows Fundamentals for DBAs (1 day)",
  "M1b": "Azure VMs and Virtual Networks for DBAs (1 day)",
  "M2": "Deploy a Database Management System (DBMS)",
  "M2a": "Deploying and Provisioning SQL Server (1 day)",
  "M2b": "Upgrading SQL Server (1 day)",
  "M2c": "Managing SQL Server Databases and Files (0.5 day)",
  "M2d": "Implement Policy-based Management (0.5 day)",
  "M3": "Manage DBMS Security",
  "M3a": "Implement SQL Server Security (1.5 day)",
  "M3b": "Implement Azure SQL DB Security (1 day)",
  "M4": "Manage DBMS Data Recovery",
  "M4a": "Implement SQL Server Data Recovery (1 day)",
  "M4b": "Implement Azure SQL DB Data Recovery (0.5 day)",
  "M5": "Manage Database Operations",
  "M5a": "Manage SQL Server Operation (1 day)",
  "M5b": "Automating SQL Server Administration using Power Shell (1 day)",
  "M6": "Monitor and Manage DBMS Health",
  "M6a": "Manage Database Performance and Activity (1 day)",
  "M6b": "Implement Resource Governor (0.5 day)",
  "M6c": "Monitor SQL Server Health - Data Collector and UCP (1 day)",
  "M7": "Implement DBMS High Availability",
  "M7a": "Implement Log Shipping (0.5 day)",
  "M7b": "Implement AlwaysOn Availability Groups (1 day)",
  "M7c": "Implement AlwaysOn Failover Clustering (1 day)",
  "M8": "Implement Database Replication",
  "M8a": "Implement SQL Server Replication (1 day)",
  "M9": "Database Administration",

  "E": ["Enterprise BI Development",
	{"colors": ["white", "gray", "brown"], "par": "F"}],
  "E1": "Analyze and Visualize Data",
  "E1a": "Analyze and Visualize Data with Power BI and Excel (1 Day)",
  "E1b": "Analyze and Visualize Data with Power BI Designer (1 Day)",
  "E2": "Implement Data Warehouses",
  "E2a": "Implement a Database for Data Warehousing (1 Day)",
  "E3": "Collect Data using ETL",
  "E3a": "Implement ETL with SSIS (2 Days)",
  "E4": "Manage Data Quality using MDS and DQS",
  "E4a": "Implement Master Data Services (1 Day)",
  "E4b": "Implement Data Quality Services (1 Day)",
  "E5": "Implement Data Models",
  "E5a": "Implement Multidimensional Data Models with SSAS (1 Day)",
  "E5b": "Implement Tabular Data Models with SSAS (1 Day)",
  "E5c": "Implement Data Mining with SSAS (0.5 Day)",
  "E6": "Implement Reporting",
  "E6a": "Install and Configure SSRS (1 Day)",
  "E6b": "Create Reports with SSRS (1 Day)",
  "E6c": "Implement BI Dashboards in SPS PPS (1 Day)",
  "E7": "Deliver Self-Service BI",
  "E7a": "Deliver Self-Service Reporting with SSRS (0.5 Day)",
  "E7b": "Implement PowerPivot and Pover View in SPS (1 Day)",
  "E7c": "Configure and Manage Power BI in Office 365 (1 Day)",
  "E7d": "Configure and Manage Power BI.com (1 Day)",
  "E8": "Enterprise BI Development",

  "I": ["",
	{"colors": ["white", "gray", "brown"], "par": "E4b"}],
  "I1": "Implement a Big Data Solution with APS (1 Day)",
  "I2":
   "Implement a Cloud Data Warehouse with Azure SQL Data Warehouse (1 Day)",

  "A": ["Advanced Analytics",
	{"colors": ["white", "gray", "rgba(0, 0, 255, 1.0)"], "par": "E1"}],
  "A1": "Understand Cloud Service Fundamentals for Advanced Analytics",
  "A1a": "Azure Fundamentals for Analytics (1 Day)",
  "A2": "Analyze Big Data using Cloud Services",
  "A2a": "Get Started with Big Data Analysis using Asure HDInsight (1 Day)",
  "A2b": "Implement Big Data Processing Solutions with HDInsight (1 Day)",
  "A2c": "Implement Realtime Solutions with HDInsight (1 Day)",
  "A2d": ["Implement Predictive Solutions with HDInsight (1 Day)",
	{"twin": "E4b"}],
  "A3": "Orchestrate Cloud Data",
  "A3a": "Orchestrate Cloud Data using Azure Data Factory (1 Day)",
  "A4": "Perform Predictive Analysis using Machine Learning",
  "A4a":
   "Get Started with Predictive Analysis using Azure Machine Learning (1 Day)",
  "A4b": "Evaluate Azure Machine Learning Algorithms (1 Day)",
  "A4c": "Use R and Python in Azure Machine Learning Solutions (1 Day)",
  "A4d": "Build, Deploy and Consume Azure Machine Learning Services (1 Day)",
  "A5": "Analyze Real-time Data using Cloud Services",
  "A5a": "Analyze Real-Time Data using Azure Stream Analytics (1 Day)",
  "A6": "Implement a Cloud Data Directory",
  "A6a": "Implement Azure Data Directory (1 Day)",
  "A7": "Integrate Cloud Data Analytics Solutions",
  "A7a": "Implement Advanced Analytics Solutions with Azure (1 Day)",
  "A8": "Advanced Analytics"
 }
}
