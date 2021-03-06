/****** Object:  Table [dbo].[User]    Script Date: 2015-06-09 1:26:46 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[User](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[Email] [nvarchar](50) NOT NULL,
	[Image] [nvarchar](255) NULL,
	[Completed] [bit] NOT NULL DEFAULT 0,
 CONSTRAINT [PK_User] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)
) ON [PRIMARY]

GO

ALTER TABLE [dbo].[User] ADD CONSTRAINT [UniqueEmail] UNIQUE (Email)

GO