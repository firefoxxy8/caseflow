class AppealStreamSnapshot < ActiveRecord::Base
  self.table_name = "hearing_appeal_stream_snapshots"

  belongs_to :hearing
  belongs_to :appeal
end
