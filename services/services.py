from services.settings_service import SettingsService
from services.ytdlp_service import YtDlpService
from services.account_service import AccountService
from services.subservices.addgroup_service import AddGroupService
from services.subservices.addchannel_service import AddChannelService
from services.subservices.fetchmetadata_service import FetchMetadataService
from services.db.database_initializer import initialize_database
from services.subservices.dlp_download_service import DlpDownloadService
from services.subservices.insta_service import InstaService

class AppServices:
    # Removed 'style' from initialization
    def __init__(self):
        # Initialize the database
        initialize_database()

        # Initialize all services without passing style
        self.settings = SettingsService()
        self.ytdlp = YtDlpService()
        self.account = AccountService()
        self.add_group = AddGroupService()
        self.add_channel_service = AddChannelService(self.ytdlp, self.settings)
        self.fetch_metadata = FetchMetadataService()
        self.dlp_download_service = DlpDownloadService()

        self.insta = InstaService()

        